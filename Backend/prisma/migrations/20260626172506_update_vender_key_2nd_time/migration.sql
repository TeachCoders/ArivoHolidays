/*
  Warnings:

  - You are about to drop the column `vendoName` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `vendarName` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "vendoName",
ADD COLUMN     "vendarName" TEXT NOT NULL;
