/*
  Warnings:

  - A unique constraint covering the columns `[userId,animeId]` on the table `likes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,mangaId]` on the table `likes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."likes" ADD COLUMN     "animeId" INTEGER,
ADD COLUMN     "mangaId" INTEGER,
ALTER COLUMN "characterId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "likes_animeId_idx" ON "public"."likes"("animeId");

-- CreateIndex
CREATE INDEX "likes_mangaId_idx" ON "public"."likes"("mangaId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_animeId_key" ON "public"."likes"("userId", "animeId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_mangaId_key" ON "public"."likes"("userId", "mangaId");

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "public"."Anime"("malId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "public"."Manga"("malId") ON DELETE CASCADE ON UPDATE CASCADE;
