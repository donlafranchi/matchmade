-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interest_fromUserId_idx" ON "Interest"("fromUserId");

-- CreateIndex
CREATE INDEX "Interest_toUserId_idx" ON "Interest"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_fromUserId_toUserId_key" ON "Interest"("fromUserId", "toUserId");

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
