import { BaseETLService } from "./BaseETLService.js";
import type { Prisma } from "@prisma/client";

export class AnimeETLService extends BaseETLService<any> {
  protected entityType = 'anime' as const;
  protected listEndpoint = 'anime';
  protected fullEndpoint = 'anime';

  protected mapToCreateInput(data: any): Prisma.XOR<Prisma.AnimeCreateInput, Prisma.AnimeUncheckedCreateInput> {
    return {
      malId: data.mal_id,
      title: data.title || '',
      titleEnglish: data.title_english || null,
      titleJapanese: data.title_japanese || null,
      url: data.url || null,
      imagesJson: data.images || {},
      synopsis: data.synopsis || null,
      episodes: data.episodes || null,
      status: data.status || null,
      type: data.type || null,
      source: data.source || null,
      rating: data.rating || null,
      score: data.score || null,
      rank: data.rank || null,
      popularity: data.popularity || null,
      favorites: data.favorites || 0,
      genres: data.genres ? data.genres.map((g: any) => g.name) : [],
      studios: data.studios ? data.studios.map((s: any) => s.name) : [],
      season: data.season || null,
      year: data.year || null,
      duration: data.duration || null,
      rawJson: data,
    };
  }

  protected mapToUpdateInput(data: any): Prisma.XOR<Prisma.AnimeUpdateInput, Prisma.AnimeUncheckedUpdateInput> {
    return {
      title: data.title || '',
      titleEnglish: data.title_english || null,
      titleJapanese: data.title_japanese || null,
      url: data.url || null,
      imagesJson: data.images || {},
      synopsis: data.synopsis || null,
      episodes: data.episodes || null,
      status: data.status || null,
      type: data.type || null,
      source: data.source || null,
      rating: data.rating || null,
      score: data.score || null,
      rank: data.rank || null,
      popularity: data.popularity || null,
      favorites: data.favorites || 0,
      genres: data.genres ? data.genres.map((g: any) => g.name) : [],
      studios: data.studios ? data.studios.map((s: any) => s.name) : [],
      season: data.season || null,
      year: data.year || null,
      duration: data.duration || null,
      rawJson: data,
    };
  }
}