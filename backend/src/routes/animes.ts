import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "@prisma/client";

const ALLOWED_SORT = new Set(["malId", "favorites", "score", "title", "popularity", "rank"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

export const animeRoutes: FastifyPluginAsync = async (app) => {
  app.get("/anime", async (req) => {
    const {
      sort = "favorites",
      order = "desc",
      limit = 50,
      offset = 0,
    } = (req.query ?? {}) as {
      sort?: "malId" | "favorites" | "score" | "title" | "popularity" | "rank";
      order?: "asc" | "desc";
      limit?: number;
      offset?: number;
    };

    const sortField = ALLOWED_SORT.has(sort) ? sort : "favorites";
    const sortOrder: "asc" | "desc" = ALLOWED_ORDER.has(order) ? order : "desc";
    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const skip = Math.max(Number(offset) || 0, 0);

    const [total, rows] = await Promise.all([
      prisma.anime.count(),
      prisma.anime.findMany({
        orderBy: { [sortField]: sortOrder } as Prisma.AnimeOrderByWithRelationInput,
        select: {
          malId: true,
          title: true,
          titleEnglish: true,
          titleJapanese: true,
          favorites: true,
          score: true,
          episodes: true,
          status: true,
          type: true,
          imagesJson: true,
          genres: true,
        },
        take,
        skip,
      }),
    ]);

    const items = rows.map((r) => ({
      malId: r.malId,
      title: r.title,
      titleEnglish: r.titleEnglish,
      titleJapanese: r.titleJapanese,
      favorites: r.favorites,
      score: r.score,
      episodes: r.episodes,
      status: r.status,
      type: r.type,
      imagesJson: r.imagesJson,
      genres: r.genres,
    }));

    return {
      meta: { total, limit: take, offset: skip, sort: sortField, order: sortOrder },
      items,
    };
  });

  // GET /anime/:id -> detail
  app.get("/anime/:id", {
    schema: {
      params: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  }, async (req, reply) => {
    const id = Number((req.params as any).id);
    if (!Number.isFinite(id)) return reply.code(400).send({ error: "Invalid id" });

    const row = await prisma.anime.findUnique({
      where: { malId: id },
      select: {
        malId: true,
        title: true,
        titleEnglish: true,
        titleJapanese: true,
        url: true,
        imagesJson: true,
        synopsis: true,
        episodes: true,
        status: true,
        type: true,
        source: true,
        rating: true,
        score: true,
        rank: true,
        popularity: true,
        favorites: true,
        genres: true,
        studios: true,
        season: true,
        year: true,
        duration: true,
      },
    });

    if (!row) return reply.code(404).send({ error: "Not found" });

    return {
      malId: row.malId,
      title: row.title,
      titleEnglish: row.titleEnglish,
      titleJapanese: row.titleJapanese,
      url: row.url,
      imagesJson: row.imagesJson,
      synopsis: row.synopsis,
      episodes: row.episodes,
      status: row.status,
      type: row.type,
      source: row.source,
      rating: row.rating,
      score: row.score,
      rank: row.rank,
      popularity: row.popularity,
      favorites: row.favorites,
      genres: row.genres,
      studios: row.studios,
      season: row.season,
      year: row.year,
      duration: row.duration,
    };
  });
};
