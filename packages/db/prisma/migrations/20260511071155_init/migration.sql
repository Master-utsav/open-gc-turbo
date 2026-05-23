-- CreateEnum
CREATE TYPE "GlobalMessageType" AS ENUM ('TEXT', 'GIF');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GlobalMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "type" "GlobalMessageType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" INTEGER NOT NULL,

    CONSTRAINT "GlobalMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "GlobalMessage_createdAt_idx" ON "GlobalMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "GlobalMessage" ADD CONSTRAINT "GlobalMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
