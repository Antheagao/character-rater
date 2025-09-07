import { BaseETLService } from "./BaseETLService.js";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import { getJSON, JIKAN_BASE } from "./utils.js";

export class CharacterETLService extends BaseETLService<any> {
  protected entityType = 'character' as const;
  protected listEndpoint = 'characters';
  protected fullEndpoint = 'characters';

  protected mapToCreateInput(data: any): Prisma.CharacterCreateInput {
    return {
      malId: data.mal_id,
      name: data.name,
      nameKanji: data.name_kanji || null,
      url: data.url || null,
      about: data.about || null,
      nicknames: data.nicknames || [],
      imagesJson: data.images || {},
      favorites: data.favorites || 0,
      rawJson: data,
    };
  }

  protected mapToUpdateInput(data: any): Prisma.CharacterUpdateInput {
    return {
      name: data.name,
      nameKanji: data.name_kanji || null,
      url: data.url || null,
      about: data.about || null,
      nicknames: data.nicknames || [],
      imagesJson: data.images || {},
      favorites: data.favorites || 0,
      rawJson: data,
    };
  }

  // Override hydrateOne to handle relationships
  async hydrateOne(id: number): Promise<void> {
    try {
      const url = `${JIKAN_BASE}/characters/${id}/full`;
      const json = await getJSON<any>(url);
      const d = json.data;

      await super.hydrateOne(id);

      // Handle anime appearances
      if (Array.isArray(d.anime)) {
        for (const item of d.anime) {
          const a = item?.anime;
          if (!a?.mal_id) continue;

          const aImages = JSON.parse(JSON.stringify(a.images ?? {}));
          const aRaw = JSON.parse(JSON.stringify(a));

          await prisma.anime.upsert({
            where: { malId: a.mal_id },
            update: {
              title: a.title ?? "",
              url: a.url ?? null,
              imagesJson: aImages,
              rawJson: aRaw,
            },
            create: {
              malId: a.mal_id,
              title: a.title ?? "",
              url: a.url ?? null,
              imagesJson: aImages,
              rawJson: aRaw,
            },
          });

          await prisma.characterAnime
            .create({
              data: {
                characterId: d.mal_id,
                animeId: a.mal_id,
                role: item?.role ?? "",
              },
            })
            .catch(() => {});
        }
      }

      // Handle manga appearances
      if (Array.isArray(d.manga)) {
        for (const item of d.manga) {
          const m = item?.manga;
          if (!m?.mal_id) continue;

          const mImages = JSON.parse(JSON.stringify(m.images ?? {}));
          const mRaw = JSON.parse(JSON.stringify(m));

          await prisma.manga.upsert({
            where: { malId: m.mal_id },
            update: {
              title: m.title ?? "",
              url: m.url ?? null,
              imagesJson: mImages,
              rawJson: mRaw,
            },
            create: {
              malId: m.mal_id,
              title: m.title ?? "",
              url: m.url ?? null,
              imagesJson: mImages,
              rawJson: mRaw,
            },
          });

          await prisma.characterManga
            .create({
              data: {
                characterId: d.mal_id,
                mangaId: m.mal_id,
                role: item?.role ?? "",
              },
            })
            .catch(() => {});
        }
      }

      if (id % 250 === 0) console.log(`[character hydrate] upsert ok mal_id=${id}`);
    } catch (e: any) {
      console.error(`[character hydrate] FAIL mal_id=${id}: ${e?.message ?? e}`);
    }
  }
}
