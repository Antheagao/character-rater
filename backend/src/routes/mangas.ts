import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "@prisma/client";

const ALLOWED_SORT = new Set(["malId", "favorites", "score", "title"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

export const mangaRoutes: FastifyPluginAsync = async (app) => {
  app.get("/manga", async (req) => {
    const { sort = "favorites", order = "desc", limit = 50, offset = 0 } = (req.query ?? {}) as any;

    const take = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const skip = Math.max(Number(offset) || 0, 0);

    const [total, rows] = await Promise.all([
      prisma.manga.count(),
      prisma.manga.findMany({
        orderBy: { [sort]: order },
        select: { malId: true, title: true, favorites: true, imagesJson: true },
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

    return { meta: { total, limit: take, offset: skip, sort, order }, items };
  });

  // GET /manga/:id -> detail
  app.get("/manga/:id", {
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

    const row = await prisma.manga.findUnique({
      where: { malId: id },
      select: {
        malId: true,
        title: true,
        favorites: true,
        //score: true,
        //chapters: true,
        //status: true,
        //synopsis: true,
        imagesJson: true,
      },
    });

    if (!row) return reply.code(404).send({ error: "Not found" });

    return {
      malId: row.malId,
      name: row.title,         // map title -> name
      favorites: row.favorites,
      //score: row.score,
      //chapters: row.chapters,
      //status: row.status,
      //synopsis: row.synopsis,
      imagesJson: row.imagesJson,
    };
  });
};
