-- AlterTable
ALTER TABLE "ProfileDimension" ADD COLUMN     "questionType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "experiencePreference" TEXT;
