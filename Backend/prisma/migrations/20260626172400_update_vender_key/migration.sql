/*
  Warnings:

  - You are about to drop the column `address` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `bannerImage` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `gstNumber` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `profileImage` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `vendorType` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `workingAreas` on the `Vendor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vendarEmail]` on the table `Vendor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vendarCompanyName` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendarEmail` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendarMobile` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendarPassword` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendoName` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Vendor_email_key";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "address",
DROP COLUMN "bannerImage",
DROP COLUMN "companyName",
DROP COLUMN "email",
DROP COLUMN "gstNumber",
DROP COLUMN "isActive",
DROP COLUMN "mobile",
DROP COLUMN "name",
DROP COLUMN "password",
DROP COLUMN "profileImage",
DROP COLUMN "vendorType",
DROP COLUMN "website",
DROP COLUMN "workingAreas",
ADD COLUMN     "vendarAddress" TEXT,
ADD COLUMN     "vendarBannerImage" TEXT,
ADD COLUMN     "vendarCompanyName" TEXT NOT NULL,
ADD COLUMN     "vendarEmail" TEXT NOT NULL,
ADD COLUMN     "vendarIsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "vendarMobile" TEXT NOT NULL,
ADD COLUMN     "vendarPassword" TEXT NOT NULL,
ADD COLUMN     "vendarProfileImage" TEXT,
ADD COLUMN     "vendarServiceType" "VendorType" NOT NULL DEFAULT 'ALL',
ADD COLUMN     "vendarWebsite" TEXT,
ADD COLUMN     "vendarWorkingAreas" TEXT[],
ADD COLUMN     "vendoName" TEXT NOT NULL,
ADD COLUMN     "vndarGstNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_vendarEmail_key" ON "Vendor"("vendarEmail");
