import { BaseETLService } from "./BaseETLService.js";
import type { Prisma } from "@prisma/client";

export class MangaETLService extends BaseETLService<any> {
  protected entityType = 'manga' as const;
  protected listEndpoint = 'manga';
  protected fullEndpoint = 'manga';

  protected mapToCreateInput(data: any): Prisma.XOR<Prisma.MangaCreateInput, Prisma.MangaUncheckedCreateInput> {
    return {
      malId: data.mal_id,
      title: data.title || '',
      titleEnglish: data.title_english || null,
      titleJapanese: data.title_japanese || null,
      url: data.url || null,
      imagesJson: data.images || {},
      synopsis: data.synopsis || null,
      chapters: data.chapters || null,
      volumes: data.volumes || null,
      status: data.status || null,
      type: data.type || null,
      score: data.score || null,
      rank: data.rank || null,
      popularity: data.popularity || null,
      favorites: data.favorites || 0,
      genres: data.genres ? data.genres.map((g: any) => g.name) : [],
      authors: data.authors ? data.authors.map((a: any) => a.name) : [],
      serialization: data.serialization || null,
      year: data.published?.year || data.year || null,
      rawJson: data,
    };
  }

  protected mapToUpdateInput(data: any): Prisma.XOR<Prisma.MangaUpdateInput, Prisma.MangaUncheckedUpdateInput> {
    return {
      title: data.title || '',
      titleEnglish: data.title_english || null,
      titleJapanese: data.title_japanese || null,
      url: data.url || null,
      imagesJson: data.images || {},
      synopsis: data.synopsis || null,
      chapters: data.chapters || null,
      volumes: data.volumes || null,
      status: data.status || null,
      type: data.type || null,
      score: data.score || null,
      rank: data.rank || null,
      popularity: data.popularity || null,
      favorites: data.favorites || 0,
      genres: data.genres ? data.genres.map((g: any) => g.name) : [],
      authors: data.authors ? data.authors.map((a: any) => a.name) : [],
      serialization: data.serialization || null,
      year: data.published?.year || data.year || null,
      rawJson: data,
    };
  }
}
