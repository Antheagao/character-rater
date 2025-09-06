import type { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";
import { AnimeETLService } from "../etl/AnimeETLService.js";
import { MangaETLService } from "../etl/MangaETLService.js";
import { CharacterETLService } from "../etl/CharacterETLService.js";

const animeService = new AnimeETLService();
const mangaService = new MangaETLService();
const characterService = new CharacterETLService();

export async function adminRoutes(app: FastifyInstance) {
  // Status endpoint
  app.get("/admin/status", async () => {
    const [charCount, animeCount, mangaCount, meta] = await Promise.all([
      prisma.character.count(),
      prisma.anime.count(),
      prisma.manga.count(),
      prisma.crawlerMeta.findMany(),
    ]);
    return { charCount, animeCount, mangaCount, meta };
  });

  // Reset crawler pointers
  app.post("/admin/reset-crawler/:type", async (request) => {
    const { type } = request.params as { type: "characters" | "anime" | "manga" };
    await prisma.crawlerMeta.deleteMany({ where: { key: `last_${type}_page` } });
    return { ok: true, message: `Reset ${type} crawler meta` };
  });

  // Bootstrap endpoints
  app.post("/admin/bootstrap/:type", async (request) => {
    const { type } = request.params as { type: "characters" | "anime" | "manga" };
    
    const service = {
      characters: characterService,
      anime: animeService,
      manga: mangaService,
    }[type];

    void service.crawlAndHydrateAllPages();
    return { ok: true, message: `${type} bootstrap started` };
  });

  // Refresh endpoints
  app.post("/admin/refresh/:type", async (request) => {
    const { type } = request.params as { type: "characters" | "anime" | "manga" };
    const { slicePercent = 2 } = request.body as { slicePercent?: number };
    
    const service = {
      characters: characterService,
      anime: animeService,
      manga: mangaService,
    }[type];

    await service.incrementalRefresh(slicePercent);
    return { ok: true, message: `${type} refresh done` };
  });
}
