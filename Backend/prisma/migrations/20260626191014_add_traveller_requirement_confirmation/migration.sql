-- CreateTable
CREATE TABLE "TravellerRequirementConfirmation" (
    "id" SERIAL NOT NULL,
    "travellerId" INTEGER NOT NULL,
    "serviceType" TEXT,
    "cityNames" TEXT,
    "tourTypes" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "adults" INTEGER NOT NULL DEFAULT 0,
    "children" INTEGER NOT NULL DEFAULT 0,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "needGuide" BOOLEAN NOT NULL DEFAULT false,
    "needActivities" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TravellerRequirementConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TravellerRequirementConfirmation_travellerId_key" ON "TravellerRequirementConfirmation"("travellerId");

-- AddForeignKey
ALTER TABLE "TravellerRequirementConfirmation" ADD CONSTRAINT "TravellerRequirementConfirmation_travellerId_fkey" FOREIGN KEY ("travellerId") REFERENCES "Traveller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
