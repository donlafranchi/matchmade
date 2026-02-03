-- CreateTable
CREATE TABLE "ProfileDimension" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "formation" INTEGER NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "importance" INTEGER NOT NULL DEFAULT 0,
    "rawAnswer" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileDimension_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackResponse" (
    "id" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "matchId" TEXT,
    "ease" INTEGER NOT NULL,
    "seeAgain" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileDimension_userId_idx" ON "ProfileDimension"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileDimension_userId_dimension_key" ON "ProfileDimension"("userId", "dimension");

-- CreateIndex
CREATE INDEX "FeedbackResponse_fromUserId_idx" ON "FeedbackResponse"("fromUserId");

-- CreateIndex
CREATE INDEX "FeedbackResponse_toUserId_idx" ON "FeedbackResponse"("toUserId");

-- AddForeignKey
ALTER TABLE "ProfileDimension" ADD CONSTRAINT "ProfileDimension_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackResponse" ADD CONSTRAINT "FeedbackResponse_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
