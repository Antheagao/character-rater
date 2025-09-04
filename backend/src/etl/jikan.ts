// src/etl/jikan.ts
import { prisma } from "../db/prisma.js";
import type { Prisma } from "@prisma/client";
import { request } from "undici";
import Bottleneck from "bottleneck";
import PQueue from "p-queue";

const JIKAN_BASE = process.env.JIKAN_BASE ?? "https://api.jikan.moe/v4";

/**
 * Hard rate limits: 3 req/s AND 60 req/min (Jikan docs).
 * We chain two Bottleneck limiters so every call must pass both.
 */
const perSecond = new Bottleneck({
  reservoir: 3,
  reservoirRefreshAmount: 3,
  reservoirRefreshInterval: 1_000,
  maxConcurrent: 1, // avoid bursts
});
const perMinute = new Bottleneck({
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval: 60_000,
  maxConcurrent: 1,
});
perSecond.chain(perMinute);
const schedule = <T>(fn: () => Promise<T>) => perSecond.schedule(fn);

/**
 * Optional local queue for organizing page-batch hydration (not for rate limit).
 * Keep small concurrency; Bottleneck still gates actual HTTP rates.
 */
const pageQueue = new PQueue({ concurrency: 2 });

type CharacterListResp = {
  data: { mal_id: number; name: string }[];
  pagination: { has_next_page: boolean };
};

type CharacterFullResp = {
  data: {
    mal_id: number;
    name: string;
    about?: string | null;
    nicknames?: string[] | null;
    images?: Record<string, unknown> | null;
    favorites?: number | null;
  };
};

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
function jitter(ms: number) {
  return ms + Math.floor(Math.random() * 200);
}

/** GET + JSON with retries; honors Retry-After on 429 */
async function getJSON<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await schedule(() => request(url, { method: "GET" }));

    // Success
    if (res.statusCode && res.statusCode < 300) {
      return (await res.body.json()) as T;
    }

    // Too many requests: respect Retry-After (seconds)
    if (res.statusCode === 429) {
      const ra = res.headers["retry-after"];
      const sec = Array.isArray(ra) ? Number(ra[0]) : Number(ra);
      const waitMs = Number.isFinite(sec) ? sec * 1000 : jitter(1500 * (attempt + 1));
      await sleep(waitMs);
      continue;
    }

    // Transient server error: exponential backoff
    if (res.statusCode && res.statusCode >= 500) {
      await sleep(jitter(800 * (attempt + 1)));
      continue;
    }

    // Other 4xx: log body and abort (don’t retry)
    const text = await res.body.text();
    throw new Error(`HTTP ${res.statusCode} for ${url}: ${text.slice(0, 200)}`);
  }
  throw new Error(`Failed after retries: ${url}`);
}

async function hydrateOneCharacter(id: number) {
  try {
    const url = `${JIKAN_BASE}/characters/${id}/full`;
    const json = await getJSON<CharacterFullResp>(url);
    const d = json.data;

    // Ensure JSON-serializable for Prisma JSON columns
    const raw: Prisma.InputJsonValue = JSON.parse(JSON.stringify(d));
    const images: Prisma.InputJsonValue = JSON.parse(JSON.stringify(d.images ?? {}));

    await prisma.character.upsert({
      where: { malId: d.mal_id },
      update: {
        name: d.name,
        about: d.about ?? null,
        nicknames: d.nicknames ?? [],
        imagesJson: images,
        favorites: d.favorites ?? null,
        rawJson: raw,
      },
      create: {
        malId: d.mal_id,
        name: d.name,
        about: d.about ?? null,
        nicknames: d.nicknames ?? [],
        imagesJson: images,
        favorites: d.favorites ?? null,
        rawJson: raw,
      },
    });

    if (id % 250 === 0) console.log(`[hydrate] upsert ok mal_id=${id}`);
  } catch (e: any) {
    console.error(`[hydrate] FAIL mal_id=${id}: ${e?.message ?? e}`);
  }
}

export async function hydrateCharacters(ids: number[]) {
  if (!ids.length) return;
  console.log(`[hydrate] scheduling ${ids.length} ids`);
  // Run each page’s ids with modest parallelism; Bottleneck enforces real rate limits.
  await pageQueue.add(async () => {
    await Promise.all(ids.map((id) => hydrateOneCharacter(id)));
  });
}

/** Discover page → enqueue hydrate for that page → proceed */
export async function crawlAndHydrateAllPages(): Promise<void> {
  const meta = await prisma.crawlerMeta.findUnique({ where: { key: "last_char_page" } });
  let page = Number(meta?.value ?? 1);

  while (true) {
    const listUrl = `${JIKAN_BASE}/characters?page=${page}`;
    const json = await getJSON<CharacterListResp>(listUrl);

    const pageIds = json.data.map((c) => c.mal_id);
    console.log(`[discover] page=${page} ids=${pageIds.length} -> enqueue hydrate`);
    await hydrateCharacters(pageIds);

    await prisma.crawlerMeta.upsert({
      where: { key: "last_char_page" },
      update: { value: String(page) },
      create: { key: "last_char_page", value: String(page) },
    });

    if (!json.pagination?.has_next_page) break;
    page += 1;
  }

  // Wait for all hydration tasks to finish
  await pageQueue.onIdle();
  console.log(`[crawl] finished; queue drained`);
}

/** API compatibility; runs the streaming crawler */
export async function bootstrapCharacters() {
  console.log(`[bootstrap] crawling & hydrating per page...`);
  await crawlAndHydrateAllPages();
  console.log(`[bootstrap] done`);
}

type IncrementalRefreshOpts = { slicePercent?: number };

export async function incrementalRefresh({ slicePercent = 1 }: IncrementalRefreshOpts = {}) {
  const total = await prisma.character.count();
  if (total === 0) return;

  const pct = Math.min(100, Math.max(0, slicePercent ?? 1));
  const slice = Math.max(1, Math.floor((pct / 100) * total));

  const rows: { malId: number }[] = await prisma.character.findMany({
    orderBy: { updatedAt: "asc" },
    take: slice,
    select: { malId: true },
  });
  if (!rows.length) return;

  console.log(`[refresh] rehydrating ${rows.length} / ${total} (${pct}%)`);
  await hydrateCharacters(rows.map((r) => r.malId));
  await pageQueue.onIdle();
}
