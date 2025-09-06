-- AlterTable
ALTER TABLE "public"."Anime" ADD COLUMN     "popularity" INTEGER,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "score" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Manga" ADD COLUMN     "popularity" INTEGER,
ADD COLUMN     "rank" INTEGER,
ADD COLUMN     "score" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Anime_score_idx" ON "public"."Anime"("score");

-- CreateIndex
CREATE INDEX "Anime_rank_idx" ON "public"."Anime"("rank");

-- CreateIndex
CREATE INDEX "Anime_popularity_idx" ON "public"."Anime"("popularity");

-- CreateIndex
CREATE INDEX "Manga_score_idx" ON "public"."Manga"("score");

-- CreateIndex
CREATE INDEX "Manga_rank_idx" ON "public"."Manga"("rank");

-- CreateIndex
CREATE INDEX "Manga_popularity_idx" ON "public"."Manga"("popularity");
