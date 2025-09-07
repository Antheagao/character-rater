-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_passwordHash_key" ON "public"."users"("passwordHash");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "public"."sessions"("token");

-- CreateIndex
CREATE INDEX "likes_characterId_idx" ON "public"."likes"("characterId");

-- CreateIndex
CREATE INDEX "likes_userId_idx" ON "public"."likes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_userId_characterId_key" ON "public"."likes"("userId", "characterId");

-- CreateIndex
CREATE INDEX "comments_characterId_idx" ON "public"."comments"("characterId");

-- CreateIndex
CREATE INDEX "comments_userId_idx" ON "public"."comments"("userId");

-- CreateIndex
CREATE INDEX "comments_createdAt_idx" ON "public"."comments"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."likes" ADD CONSTRAINT "likes_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."Character"("malId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."Character"("malId") ON DELETE CASCADE ON UPDATE CASCADE;
