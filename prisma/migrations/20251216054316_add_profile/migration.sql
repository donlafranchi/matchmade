-- CreateEnum
CREATE TYPE "RelationshipContextType" AS ENUM ('romantic', 'friendship', 'professional', 'creative', 'service');

-- CreateEnum
CREATE TYPE "TonePreference" AS ENUM ('light', 'balanced', 'serious');

-- CreateEnum
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant', 'system');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextType" "RelationshipContextType" NOT NULL,
    "tonePreference" "TonePreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContextProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextProfileId" TEXT NOT NULL,
    "role" "ChatRole" NOT NULL,
    "content" TEXT,
    "offRecord" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "contextProfileId" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "completeness" INTEGER NOT NULL DEFAULT 0,
    "missing" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContextProfile_userId_contextType_key" ON "ContextProfile"("userId", "contextType");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_contextProfileId_key" ON "Profile"("contextProfileId");

-- AddForeignKey
ALTER TABLE "ContextProfile" ADD CONSTRAINT "ContextProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_contextProfileId_fkey" FOREIGN KEY ("contextProfileId") REFERENCES "ContextProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_contextProfileId_fkey" FOREIGN KEY ("contextProfileId") REFERENCES "ContextProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
