-- AlterTable
ALTER TABLE "public"."comments" ADD COLUMN     "animeId" INTEGER,
ADD COLUMN     "mangaId" INTEGER,
ALTER COLUMN "characterId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "comments_animeId_idx" ON "public"."comments"("animeId");

-- CreateIndex
CREATE INDEX "comments_mangaId_idx" ON "public"."comments"("mangaId");

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "public"."Anime"("malId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "public"."Manga"("malId") ON DELETE CASCADE ON UPDATE CASCADE;
