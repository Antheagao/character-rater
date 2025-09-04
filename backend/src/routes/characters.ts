import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../db/prisma.js";

export const characterRoutes: FastifyPluginAsync = async (app) => {
  // Select all characters from the database
  app.get("/characters", async() => {
    const characters = await prisma.character.findMany({
      orderBy: { malId: "asc" },
      select: {
        malId: true,
        name: true,
        about: true,
        nicknames: true,
        favorites: true,
        imagesJson: true,
      },
    });
    return characters;
  });
};