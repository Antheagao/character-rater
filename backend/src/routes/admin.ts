import type { FastifyInstance } from "fastify";
import { prisma } from "../db/prisma.js";
import { bootstrapCharacters, incrementalRefresh } from "../etl/jikan.js";

export async function adminRoutes(app: FastifyInstance) {
  // Status endpoint
  app.get("/admin/status", async () => {
    const [count, meta] = await Promise.all([
      prisma.character.count(),
      prisma.crawlerMeta.findMany(),
    ]);
    return { count, meta };
  });

  app.post("/admin/reset-crawler", async () => {
    await prisma.crawlerMeta.deleteMany({ where: { key: "last_char_page" } });
    return { ok: true, message: "Reset crawler meta" };
  });

  // Bootstrap all characters
  app.post("/admin/bootstrap-characters", async () => {
    void bootstrapCharacters(); // fire-and-forget
    return { ok: true, message: "Bootstrap started" };
  });

  // Refresh a slice of characters
  app.post("/admin/refresh-characters", async () => {
    await incrementalRefresh({ slicePercent: 2 });
    return { ok: true, message: "Refresh done" };
  });
}
