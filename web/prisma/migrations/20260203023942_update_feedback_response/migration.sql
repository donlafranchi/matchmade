/*
  Warnings:

  - You are about to drop the column `ease` on the `FeedbackResponse` table. All the data in the column will be lost.
  - Added the required column `profileAccuracy` to the `FeedbackResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `safety` to the `FeedbackResponse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeedbackResponse" DROP COLUMN "ease",
ADD COLUMN     "profileAccuracy" TEXT NOT NULL,
ADD COLUMN     "safety" TEXT NOT NULL,
ADD COLUMN     "safetyDetails" TEXT,
ALTER COLUMN "seeAgain" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "FeedbackResponse_safety_idx" ON "FeedbackResponse"("safety");
