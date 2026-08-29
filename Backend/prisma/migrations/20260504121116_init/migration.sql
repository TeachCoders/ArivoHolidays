-- CreateTable
CREATE TABLE "Orgnaization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "logo_img" TEXT,
    "bannerImage" TEXT,

    CONSTRAINT "Orgnaization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "profileImage" TEXT,
    "bannerImage" TEXT,
    "hasPassword" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "org_id" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Orgnaization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
