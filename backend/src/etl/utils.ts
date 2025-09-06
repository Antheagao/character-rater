import Bottleneck from "bottleneck";
import PQueue from "p-queue";
import { request } from "undici";
import { Prisma } from "@prisma/client";

export const JIKAN_BASE = process.env.JIKAN_BASE ?? "https://api.jikan.moe/v4";

// Rate limiters
export const perSecond = new Bottleneck({
  reservoir: 3,
  reservoirRefreshAmount: 3,
  reservoirRefreshInterval: 1_000,
  maxConcurrent: 1,
});

export const perMinute = new Bottleneck({
  reservoir: 60,
  reservoirRefreshAmount: 60,
  reservoirRefreshInterval: 60_000,
  maxConcurrent: 1,
});

perSecond.chain(perMinute);
export const schedule = <T>(fn: () => Promise<T>) => perSecond.schedule(fn);

export const pageQueue = new PQueue({ concurrency: 2 });

export function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function jitter(ms: number) {
  return ms + Math.floor(Math.random() * 200);
}

export async function getJSON<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const res = await schedule(() => request(url, { method: "GET" }));

    if (res.statusCode && res.statusCode < 300) {
      return (await res.body.json()) as T;
    }

    if (res.statusCode === 429) {
      const ra = res.headers["retry-after"];
      const sec = Array.isArray(ra) ? Number(ra[0]) : Number(ra);
      const waitMs = Number.isFinite(sec) ? sec * 1000 : jitter(1500 * (attempt + 1));
      await sleep(waitMs);
      continue;
    }

    if (res.statusCode && res.statusCode >= 500) {
      await sleep(jitter(800 * (attempt + 1)));
      continue;
    }

    const text = await res.body.text();
    throw new Error(`HTTP ${res.statusCode} for ${url}: ${text.slice(0, 200)}`);
  }
  throw new Error(`Failed after retries: ${url}`);
}

export function ensureJson(val: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(val ?? {}));
}
