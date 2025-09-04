-- CreateTable
CREATE TABLE "public"."Character" (
    "malId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "about" TEXT,
    "nicknames" TEXT[],
    "imagesJson" JSONB NOT NULL,
    "favorites" INTEGER,
    "etag" TEXT,
    "rawJson" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("malId")
);

-- CreateTable
CREATE TABLE "public"."CrawlerMeta" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "CrawlerMeta_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "public"."Character"("name");
