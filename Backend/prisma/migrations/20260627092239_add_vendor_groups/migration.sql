-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "vendorGroupId" INTEGER;

-- CreateTable
CREATE TABLE "VendorGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VendorGroup_name_key" ON "VendorGroup"("name");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_vendorGroupId_fkey" FOREIGN KEY ("vendorGroupId") REFERENCES "VendorGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
