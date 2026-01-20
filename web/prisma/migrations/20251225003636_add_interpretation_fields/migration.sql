-- AlterTable
ALTER TABLE "ContextIntent" ADD COLUMN     "interpretations" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "lastAnalyzed" TIMESTAMP(3),
ADD COLUMN     "rawPatterns" JSONB NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "ProfileNew" ADD COLUMN     "interpretations" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "lastAnalyzed" TIMESTAMP(3),
ADD COLUMN     "rawPatterns" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "InterpretationFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interpretationId" TEXT NOT NULL,
    "accurate" BOOLEAN NOT NULL,
    "userCorrection" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterpretationFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterpretationFeedback_userId_idx" ON "InterpretationFeedback"("userId");

-- CreateIndex
CREATE INDEX "InterpretationFeedback_interpretationId_idx" ON "InterpretationFeedback"("interpretationId");

-- AddForeignKey
ALTER TABLE "InterpretationFeedback" ADD CONSTRAINT "InterpretationFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
