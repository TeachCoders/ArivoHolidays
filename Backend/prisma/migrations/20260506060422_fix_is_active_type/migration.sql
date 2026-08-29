/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Orgnaization` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `isActive` on the `Orgnaization` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Orgnaization" DROP COLUMN "isActive",
ADD COLUMN     "isActive" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Orgnaization_name_key" ON "Orgnaization"("name");
