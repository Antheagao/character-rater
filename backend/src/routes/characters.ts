import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db/prisma.js";
import type { Prisma } from "@prisma/client";

const ALLOWED_SORT = new Set(["malId", "favorites", "name"]);
const ALLOWED_ORDER = new Set(["asc", "desc"]);

export const characterRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/characters",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            sort:  { type: "string", enum: ["malId", "favorites", "name"] },
            order: { type: "string", enum: ["asc", "desc"] },
            limit: { type: "integer", minimum: 1, maximum: 100 },
            offset:{ type: "integer", minimum: 0 },
          },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const {
        sort = "malId",
        order = "asc",
        limit = 20,
        offset = 0,
      } = (req.query ?? {}) as {
        sort?: "malId" | "favorites" | "name";
        order?: "asc" | "desc";
        limit?: number;
        offset?: number;
      };

      const sortField = ALLOWED_SORT.has(sort) ? sort : "malId";
      const sortOrder: "asc" | "desc" = ALLOWED_ORDER.has(order) ? order : "asc";

      const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
      const skip = Math.max(Number(offset) || 0, 0);

      const orderBy: Prisma.CharacterOrderByWithRelationInput[] = [
        { [sortField]: sortOrder },
      ];

      const [total, items] = await Promise.all([
        prisma.character.count(),
        prisma.character.findMany({
          orderBy,
          select: {
            malId: true,
            name: true,
            favorites: true,
            imagesJson: true, // send full object now
          },
          take,
          skip,
        }),
      ]);

      reply.header("Cache-Control", "public, max-age=30, s-maxage=60");

      return {
        meta: { total, limit: take, offset: skip, sort: sortField, order: sortOrder },
        items,
      };
    }
  );

  app.get("/characters/:id", {
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

    const row = await prisma.character.findUnique({
      where: { malId: id },
      select: {
        malId: true,
        name: true,
        favorites: true,
        about: true,
        nicknames: true,
        imagesJson: true,
      },
    });

    if (!row) return reply.code(404).send({ error: "Not found" });

    return {
      malId: row.malId,
      name: row.name,
      favorites: row.favorites,
      about: row.about,
      nicknames: row.nicknames,
      imagesJson: row.imagesJson,
    };
  });
};
