ALTER TABLE "country" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "country" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "State" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "State" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "City" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "City" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "Month" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "Month" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "TravelExperience" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "TravelExperience" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "Journey" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "Journey" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "CmsPage" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "CmsPage" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "BlogPost" RENAME COLUMN "pageTitle" TO "h1Title";
ALTER TABLE "BlogPost" ADD COLUMN "seoTitle" TEXT;

ALTER TABLE "Banner" RENAME COLUMN "bannerTile" TO "bannerTitle";
