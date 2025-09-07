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
        order = "desc",
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
      querystring: {
        type: "object",
        properties: {
          rolesLimit: { type: "integer", minimum: 1, maximum: 100 }, // optional
        },
        additionalProperties: true,
      },
    },
  }, async (req, reply) => {
    const id = Number((req.params as any).id);
    if (!Number.isFinite(id)) return reply.code(400).send({ error: "Invalid id" });

    const { rolesLimit = 20 } = (req.query ?? {}) as { rolesLimit?: number };

    // Character core fields
    const character = await prisma.character.findUnique({
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

    if (!character) return reply.code(404).send({ error: "Not found" });

    // Anime appearances (via join table), ordered by anime.favorites desc
    const [animeRoles, mangaRoles] = await Promise.all([
      prisma.characterAnime.findMany({
        where: { characterId: id },
        include: {
          anime: {
            select: {
              malId: true,
              title: true,
              favorites: true,
              imagesJson: true,
            },
          },
        },
        orderBy: { anime: { favorites: "desc" } }, // sort by the related anime’s favorites
        take: Math.min(Math.max(Number(rolesLimit) || 20, 1), 100),
      }),
      prisma.characterManga.findMany({
        where: { characterId: id },
        include: {
          manga: {
            select: {
              malId: true,
              title: true,
              favorites: true,
              imagesJson: true,
            },
          },
        },
        orderBy: { manga: { favorites: "desc" } }, // sort by the related manga’s favorites
        take: Math.min(Math.max(Number(rolesLimit) || 20, 1), 100),
      }),
    ]);

    // Shape for frontend (normalize title -> name for consistency, include role)
    const animeAppearances = animeRoles
      .filter(r => r.anime) // guard just in case
      .map(r => ({
        malId: r.anime.malId,
        name: r.anime.title,
        favorites: r.anime.favorites ?? 0,
        imagesJson: r.anime.imagesJson,
        role: r.role, // main/supporting/etc
      }));

    const mangaAppearances = mangaRoles
      .filter(r => r.manga)
      .map(r => ({
        malId: r.manga.malId,
        name: r.manga.title,
        favorites: r.manga.favorites ?? 0,
        imagesJson: r.manga.imagesJson,
        role: r.role,
      }));

    // Return single, consistent payload
    return {
      malId: character.malId,
      name: character.name,
      favorites: character.favorites,
      about: character.about,
      nicknames: character.nicknames,
      imagesJson: character.imagesJson,
      animeAppearances, // [{ malId, name, favorites, imagesJson, role }]
      mangaAppearances, // [{ malId, name, favorites, imagesJson, role }]
    };
  });
};
