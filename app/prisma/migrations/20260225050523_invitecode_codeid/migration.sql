/*
  Warnings:

  - A unique constraint covering the columns `[codeId]` on the table `InviteCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codeId` to the `InviteCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "InviteCode_codeHash_key";

-- AlterTable
ALTER TABLE "InviteCode" ADD COLUMN     "codeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InviteCode_codeId_key" ON "InviteCode"("codeId");

-- CreateIndex
CREATE INDEX "InviteCode_expiresAt_idx" ON "InviteCode"("expiresAt");
