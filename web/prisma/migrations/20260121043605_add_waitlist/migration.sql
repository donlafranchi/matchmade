-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('pending', 'invited', 'converted', 'declined');

-- CreateEnum
CREATE TYPE "RegionalStatus" AS ENUM ('collecting', 'threshold', 'active');

-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "intro" TEXT,
    "location" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "regionPosition" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'pending',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalMetrics" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "minimumThreshold" INTEGER NOT NULL DEFAULT 50,
    "status" "RegionalStatus" NOT NULL DEFAULT 'collecting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegionalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_userId_key" ON "WaitlistEntry"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");

-- CreateIndex
CREATE INDEX "WaitlistEntry_location_idx" ON "WaitlistEntry"("location");

-- CreateIndex
CREATE INDEX "WaitlistEntry_status_idx" ON "WaitlistEntry"("status");

-- CreateIndex
CREATE INDEX "WaitlistEntry_joinedAt_idx" ON "WaitlistEntry"("joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalMetrics_location_key" ON "RegionalMetrics"("location");

-- CreateIndex
CREATE INDEX "RegionalMetrics_status_idx" ON "RegionalMetrics"("status");

-- AddForeignKey
ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
