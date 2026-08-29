/*
  Warnings:

  - You are about to drop the `TravellerBooking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TravellerBooking";

-- CreateTable
CREATE TABLE "Traveller" (
    "id" SERIAL NOT NULL,
    "travellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "pageReference" TEXT NOT NULL DEFAULT '/booking',
    "defaultPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Traveller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourBooking" (
    "id" SERIAL NOT NULL,
    "travellerId" INTEGER NOT NULL,
    "noOfPersons" INTEGER,
    "noOfChildren" INTEGER,
    "hotelCategory" TEXT,
    "travelStartDate" TIMESTAMP(3),
    "travelEndDate" TIMESTAMP(3),
    "travellerMessage" TEXT,
    "paymentScreenshotUrl" TEXT,
    "transactionId" TEXT,
    "transactionDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleBooking" (
    "id" SERIAL NOT NULL,
    "travellerId" INTEGER NOT NULL,
    "vehicleName" TEXT,
    "serviceType" TEXT,
    "travellerMessage" TEXT,
    "paymentScreenshotUrl" TEXT,
    "transactionId" TEXT,
    "transactionDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "travellerId" INTEGER NOT NULL,
    "transactionId" TEXT,
    "transactionDetail" TEXT,
    "paymentScreenshotUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TravellerDocument" (
    "id" SERIAL NOT NULL,
    "travellerId" INTEGER NOT NULL,
    "passportUrl" TEXT,
    "govtIdUrl" TEXT,

    CONSTRAINT "TravellerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Traveller_travellerId_key" ON "Traveller"("travellerId");

-- CreateIndex
CREATE UNIQUE INDEX "TravellerDocument_travellerId_key" ON "TravellerDocument"("travellerId");

-- AddForeignKey
ALTER TABLE "TourBooking" ADD CONSTRAINT "TourBooking_travellerId_fkey" FOREIGN KEY ("travellerId") REFERENCES "Traveller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleBooking" ADD CONSTRAINT "VehicleBooking_travellerId_fkey" FOREIGN KEY ("travellerId") REFERENCES "Traveller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_travellerId_fkey" FOREIGN KEY ("travellerId") REFERENCES "Traveller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TravellerDocument" ADD CONSTRAINT "TravellerDocument_travellerId_fkey" FOREIGN KEY ("travellerId") REFERENCES "Traveller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
