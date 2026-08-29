-- Drop the SEO fields added in 20260807120000_add_seo_fields.
-- The existing title/description/keyword columns serve as the SEO fields instead.
-- NOTE: content tables may be created via `prisma db push`, so guard with IF EXISTS / IF NOT EXISTS.

ALTER TABLE IF EXISTS "Journey" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "Journey" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "Journey" DROP COLUMN IF EXISTS "seoKeyword";

ALTER TABLE IF EXISTS "country" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "country" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "country" DROP COLUMN IF EXISTS "seoKeyword";

ALTER TABLE IF EXISTS "State" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "State" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "State" DROP COLUMN IF EXISTS "seoKeyword";

ALTER TABLE IF EXISTS "City" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "City" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "City" DROP COLUMN IF EXISTS "seoKeyword";

ALTER TABLE IF EXISTS "Month" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "Month" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "Month" DROP COLUMN IF EXISTS "seoKeyword";

ALTER TABLE IF EXISTS "TravelExperience" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "TravelExperience" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "TravelExperience" DROP COLUMN IF EXISTS "seoKeyword";

ALTER TABLE IF EXISTS "CmsPage" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "CmsPage" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "CmsPage" DROP COLUMN IF EXISTS "seoKeyword";

ALTER TABLE IF EXISTS "BlogPost" DROP COLUMN IF EXISTS "seoTitle";
ALTER TABLE IF EXISTS "BlogPost" DROP COLUMN IF EXISTS "seoMetaDescription";
ALTER TABLE IF EXISTS "BlogPost" DROP COLUMN IF EXISTS "seoKeyword";
