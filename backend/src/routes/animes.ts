import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "@prisma/client";

const ALLOWED_SORT = new Set(["malId", "favorites", "score", "title"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

export const animeRoutes: FastifyPluginAsync = async (app) => {
  app.get("/anime", async (req) => {
    const {
      sort = "favorites",
      order = "desc",
      limit = 50,
      offset = 0,
    } = (req.query ?? {}) as {
      sort?: "malId" | "favorites" | "score" | "title";
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
          favorites: true,
          imagesJson: true,
        },
        take,
        skip,
      }),
    ]);

    const items = rows.map((r) => ({
      malId: r.malId,
      name: r.title,
      favorites: r.favorites,
      imagesJson: r.imagesJson,
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
        favorites: true,
        //score: true,
        //episodes: true,
        //status: true,
        //synopsis: true,
        imagesJson: true,
      },
    });

    if (!row) return reply.code(404).send({ error: "Not found" });

    return {
      malId: row.malId,
      name: row.title,          // map title -> name for UI consistency
      favorites: row.favorites,
      //score: row.score,
      //episodes: row.episodes,
      //status: row.status,
      //synopsis: row.synopsis,
      imagesJson: row.imagesJson,
    };
  });
};
