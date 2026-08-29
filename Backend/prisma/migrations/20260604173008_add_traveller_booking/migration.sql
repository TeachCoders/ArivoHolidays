/*
  Warnings:

  - You are about to drop the `Teams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_teamId_fkey";

-- DropTable
DROP TABLE "Teams";

-- DropTable
DROP TABLE "Users";

-- CreateTable
CREATE TABLE "TravellerBooking" (
    "id" SERIAL NOT NULL,
    "travellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "pageReference" TEXT NOT NULL DEFAULT '/booking',
    "defaultPassword" TEXT,
    "noOfPersons" INTEGER,
    "noOfChildren" INTEGER,
    "hotelCategory" TEXT,
    "travelStartDate" TIMESTAMP(3),
    "travelEndDate" TIMESTAMP(3),
    "vehicleName" TEXT,
    "serviceType" TEXT,
    "travellerMessage" TEXT,
    "passportUrl" TEXT,
    "govtIdUrl" TEXT,
    "paymentScreenshotUrl" TEXT,
    "transactionId" TEXT,
    "transactionDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TravellerBooking_pkey" PRIMARY KEY ("id")
);
