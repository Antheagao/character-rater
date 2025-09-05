/*
  Warnings:

  - You are about to drop the column `etag` on the `Character` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Character" DROP COLUMN "etag",
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "nameKanji" TEXT,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "nicknames" SET DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "public"."Anime" (
    "malId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "imagesJson" JSONB NOT NULL,
    "favorites" INTEGER,
    "rawJson" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Anime_pkey" PRIMARY KEY ("malId")
);

-- CreateTable
CREATE TABLE "public"."Manga" (
    "malId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "imagesJson" JSONB NOT NULL,
    "favorites" INTEGER,
    "rawJson" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manga_pkey" PRIMARY KEY ("malId")
);

-- CreateTable
CREATE TABLE "public"."CharacterAnime" (
    "characterId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "CharacterAnime_pkey" PRIMARY KEY ("characterId","animeId")
);

-- CreateTable
CREATE TABLE "public"."CharacterManga" (
    "characterId" INTEGER NOT NULL,
    "mangaId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "CharacterManga_pkey" PRIMARY KEY ("characterId","mangaId")
);

-- CreateIndex
CREATE INDEX "Anime_title_idx" ON "public"."Anime"("title");

-- CreateIndex
CREATE INDEX "Manga_title_idx" ON "public"."Manga"("title");

-- CreateIndex
CREATE INDEX "CharacterAnime_animeId_idx" ON "public"."CharacterAnime"("animeId");

-- CreateIndex
CREATE INDEX "CharacterAnime_role_idx" ON "public"."CharacterAnime"("role");

-- CreateIndex
CREATE INDEX "CharacterManga_mangaId_idx" ON "public"."CharacterManga"("mangaId");

-- CreateIndex
CREATE INDEX "CharacterManga_role_idx" ON "public"."CharacterManga"("role");

-- AddForeignKey
ALTER TABLE "public"."CharacterAnime" ADD CONSTRAINT "CharacterAnime_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."Character"("malId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CharacterAnime" ADD CONSTRAINT "CharacterAnime_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "public"."Anime"("malId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CharacterManga" ADD CONSTRAINT "CharacterManga_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."Character"("malId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CharacterManga" ADD CONSTRAINT "CharacterManga_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "public"."Manga"("malId") ON DELETE CASCADE ON UPDATE CASCADE;
