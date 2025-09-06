// src/etl/BaseETLService.ts
import { prisma } from "../db/prisma.js";
import type { Prisma } from "@prisma/client";
import { getJSON, pageQueue, JIKAN_BASE } from "./utils.js";
import type { JikanResponse, JikanBase } from "./types.js";

export abstract class BaseETLService<T extends JikanBase> {
  protected abstract entityType: 'anime' | 'manga' | 'character';
  protected abstract listEndpoint: string;
  protected abstract fullEndpoint: string;

  protected abstract mapToCreateInput(data: any): Prisma.XOR<
    Prisma.AnimeCreateInput, 
    Prisma.AnimeUncheckedCreateInput
  > | Prisma.XOR<
    Prisma.MangaCreateInput, 
    Prisma.MangaUncheckedCreateInput
  > | Prisma.XOR<
    Prisma.CharacterCreateInput, 
    Prisma.CharacterUncheckedCreateInput
  >;

  protected abstract mapToUpdateInput(data: any): Prisma.XOR<
    Prisma.AnimeUpdateInput, 
    Prisma.AnimeUncheckedUpdateInput
  > | Prisma.XOR<
    Prisma.MangaUpdateInput, 
    Prisma.MangaUncheckedUpdateInput
  > | Prisma.XOR<
    Prisma.CharacterUpdateInput, 
    Prisma.CharacterUncheckedUpdateInput
  >;

  async hydrateOne(id: number): Promise<void> {
    try {
      const url = `${JIKAN_BASE}/${this.fullEndpoint}/${id}/full`;
      const json = await getJSON<JikanResponse<any>>(url);
      const d = json.data;

      const imagesJson = JSON.parse(JSON.stringify(d.images ?? {}));
      const rawJson = JSON.parse(JSON.stringify(d));

      const createData = {
        ...this.mapToCreateInput(d),
        imagesJson,
        rawJson,
      };

      const updateData = {
        ...this.mapToUpdateInput(d),
        imagesJson,
        rawJson,
      };
      
      // Use dynamic prisma client based on entity type
      await (prisma[this.entityType as 'anime' | 'manga' | 'character'] as any).upsert({
        where: { malId: d.mal_id },
        update: updateData,
        create: createData,
      });

      console.log(`[${this.entityType} hydrate] upsert ok mal_id=${id}`);
    } catch (e: any) {
      console.error(`[${this.entityType} hydrate] FAIL mal_id=${id}: ${e?.message ?? e}`);
    }
  }

  async hydrateBatch(ids: number[]): Promise<void> {
    if (!ids.length) return;
    console.log(`[${this.entityType} hydrate] scheduling ${ids.length} ids`);
    
    await pageQueue.add(async () => {
      await Promise.all(ids.map((id) => this.hydrateOne(id)));
    });
  }

  async crawlAndHydrateAllPages(): Promise<void> {
    const metaKey = `last_${this.entityType}_page`;
    const meta = await prisma.crawlerMeta.findUnique({ where: { key: metaKey } });
    let page = Number(meta?.value ?? 1);

    while (true) {
      const listUrl = `${JIKAN_BASE}/${this.listEndpoint}?page=${page}`;
      const json = await getJSON<JikanResponse<Array<{ mal_id: number }>>>(listUrl);

      const pageIds = json.data.map((item) => item.mal_id);
      console.log(`[${this.entityType} discover] page=${page} ids=${pageIds.length}`);
      await this.hydrateBatch(pageIds);

      await prisma.crawlerMeta.upsert({
        where: { key: metaKey },
        update: { value: String(page) },
        create: { key: metaKey, value: String(page) },
      });

      if (!json.pagination?.has_next_page) break;
      page += 1;
    }

    await pageQueue.onIdle();
    console.log(`[${this.entityType} crawl] finished`);
  }

  async incrementalRefresh(slicePercent: number = 1): Promise<void> {
    const total = await (prisma[this.entityType as 'anime' | 'manga' | 'character'] as any).count();
    if (total === 0) return;

    const slice = Math.max(1, Math.floor((slicePercent / 100) * total));

    const rows: { malId: number }[] = await (prisma[this.entityType as 'anime' | 'manga' | 'character'] as any).findMany({
      orderBy: { updatedAt: "asc" },
      take: slice,
      select: { malId: true },
    });

    if (!rows.length) return;

    console.log(`[${this.entityType} refresh] rehydrating ${rows.length} / ${total}`);
    await this.hydrateBatch(rows.map((r) => r.malId));
    await pageQueue.onIdle();
  }
}
