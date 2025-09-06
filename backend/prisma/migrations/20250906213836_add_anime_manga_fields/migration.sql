-- AlterTable
ALTER TABLE "public"."Anime" ADD COLUMN     "duration" TEXT,
ADD COLUMN     "episodes" INTEGER,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "rating" TEXT,
ADD COLUMN     "season" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "studios" TEXT[],
ADD COLUMN     "synopsis" TEXT,
ADD COLUMN     "titleEnglish" TEXT,
ADD COLUMN     "titleJapanese" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "public"."Manga" ADD COLUMN     "authors" TEXT[],
ADD COLUMN     "chapters" INTEGER,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "serialization" TEXT,
ADD COLUMN     "status" TEXT,
ADD COLUMN     "synopsis" TEXT,
ADD COLUMN     "titleEnglish" TEXT,
ADD COLUMN     "titleJapanese" TEXT,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "volumes" INTEGER,
ADD COLUMN     "year" INTEGER;

-- CreateIndex
CREATE INDEX "Anime_status_idx" ON "public"."Anime"("status");

-- CreateIndex
CREATE INDEX "Anime_type_idx" ON "public"."Anime"("type");

-- CreateIndex
CREATE INDEX "Anime_year_idx" ON "public"."Anime"("year");

-- CreateIndex
CREATE INDEX "Manga_status_idx" ON "public"."Manga"("status");

-- CreateIndex
CREATE INDEX "Manga_type_idx" ON "public"."Manga"("type");

-- CreateIndex
CREATE INDEX "Manga_year_idx" ON "public"."Manga"("year");
