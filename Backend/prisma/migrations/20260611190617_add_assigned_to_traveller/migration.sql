/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `TourBooking` table. All the data in the column will be lost.
  - You are about to drop the column `transactionDetail` on the `TourBooking` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_teamId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "createdAt",
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "TourBooking" DROP COLUMN "createdAt",
DROP COLUMN "transactionDetail",
ADD COLUMN     "assignedToUserId" INTEGER,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "Traveller" ADD COLUMN     "assignedToUserId" INTEGER;

-- AlterTable
ALTER TABLE "VehicleBooking" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "status" "BookingStatus" NOT NULL DEFAULT 'UPCOMING';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
DROP COLUMN "teamId",
ADD COLUMN     "managerId" INTEGER,
ADD COLUMN     "teamId" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Traveller" ADD CONSTRAINT "Traveller_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourBooking" ADD CONSTRAINT "TourBooking_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
