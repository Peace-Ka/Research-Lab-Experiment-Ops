-- AlterTable
ALTER TABLE "User" ADD COLUMN     "externalAuthId" TEXT,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_externalAuthId_key" ON "User"("externalAuthId");
