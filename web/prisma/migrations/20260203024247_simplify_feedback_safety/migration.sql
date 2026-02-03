/*
  Warnings:

  - You are about to drop the column `safety` on the `FeedbackResponse` table. All the data in the column will be lost.
  - You are about to drop the column `safetyDetails` on the `FeedbackResponse` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FeedbackResponse_safety_idx";

-- AlterTable
ALTER TABLE "FeedbackResponse" DROP COLUMN "safety",
DROP COLUMN "safetyDetails",
ADD COLUMN     "shouldRemove" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "FeedbackResponse_shouldRemove_idx" ON "FeedbackResponse"("shouldRemove");
