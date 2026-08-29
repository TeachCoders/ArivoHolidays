import { prisma } from "../utils/prismaConnection.js";

const PATTERNS = ["http://localhost:5000", "http://localhost:3000"];

async function run() {
  for (const pattern of PATTERNS) {
    const likePattern = pattern + "%";

    // Text columns
    const textCols = [
      { table: '"Media"', col: "url" },
      { table: '"Country"', col: '"thumbImg"' },
      { table: '"State"', col: '"thumbImg"' },
      { table: '"City"', col: '"thumbImg"' },
      { table: '"Month"', col: '"thumbImg"' },
      { table: '"TravelExperience"', col: '"thumbImg"' },
      { table: '"Journey"', col: '"thumbImg"' },
      { table: '"BlogPost"', col: '"thumbImg"' },
      { table: '"CmsPage"', col: '"thumbImg"' },
      { table: '"JourneyDay"', col: "image" },
      { table: '"users"', col: '"profileImage"' },
      { table: '"users"', col: '"bannerImage"' },
      { table: '"Vendor"', col: '"vendarProfileImage"' },
      { table: '"Vendor"', col: '"vendarBannerImage"' },
    ];

    for (const { table, col } of textCols) {
      try {
        const count = await prisma.$executeRawUnsafe(
          `UPDATE ${table} SET ${col} = REPLACE(${col}, '${pattern}', '') WHERE ${col} LIKE '${likePattern}'`
        );
        if (count > 0) console.log(`${table}.${col}: ${count} rows fixed`);
      } catch (e) {
        console.error(`${table}.${col} failed: ${e.message}`);
      }
    }

    // TourPackage.bannerImageUrl (JSON column)
    try {
      const count = await prisma.$executeRawUnsafe(
        `UPDATE "TourPackage" SET "bannerImageUrl" = REPLACE("bannerImageUrl"::text, '${pattern}', '')::jsonb WHERE "bannerImageUrl"::text LIKE '${likePattern}'`
      );
      if (count > 0) console.log(`TourPackage.bannerImageUrl: ${count} rows fixed`);
    } catch (e) {
      console.error(`TourPackage.bannerImageUrl failed: ${e.message}`);
    }

    // Banner.images (text array)
    try {
      const count = await prisma.$executeRawUnsafe(
        `UPDATE "Banner" SET images = array_remove(images, '${pattern}') WHERE '${pattern}' = ANY(images)`
      );
      if (count > 0) console.log(`Banner.images: ${count} rows fixed`);
    } catch (e) {
      console.error(`Banner.images failed: ${e.message}`);
    }
  }

  console.log("\nAll localhost URLs migrated to relative paths.");
  process.exit(0);
}

run();
