-- CreateTable
CREATE TABLE "ClassSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassSchedule_userId_dayOfWeek_idx" ON "ClassSchedule"("userId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
