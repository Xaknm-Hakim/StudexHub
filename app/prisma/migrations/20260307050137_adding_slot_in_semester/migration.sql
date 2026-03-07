/*
  Warnings:

  - A unique constraint covering the columns `[userId,slot]` on the table `Semester` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slot` to the `Semester` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Semester" ADD COLUMN     "slot" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Semester_userId_slot_key" ON "Semester"("userId", "slot");
