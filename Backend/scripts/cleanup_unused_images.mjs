// Script to find and delete unused images from public/documents folder
import 'dotenv/config';
import { createRequire } from 'module';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const gen = require('./generated/prisma/index.js');
const PrismaClient = gen.PrismaClient ?? gen.default?.PrismaClient ?? gen.default ?? gen;
const { PrismaPg } = require('@prisma/adapter-pg');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const docPath = path.join(__dirname, "public", "documents");

  // 1. Collect all image URLs used in the database
  const usedUrls = new Set();
  const addUrl = (url) => { if (url && typeof url === "string") usedUrls.add(url); };
  const addUrls = (arr) => { if (Array.isArray(arr)) arr.forEach(addUrl); };

  // Banners (main usage - banner images)
  const banners = await prisma.banner.findMany({ select: { images: true } });
  banners.forEach(b => addUrls(b.images));

  // Countries
  const countries = await prisma.country.findMany({ select: { thumbImg: true } });
  countries.forEach(c => addUrl(c.thumbImg));

  // States
  const states = await prisma.state.findMany({ select: { thumbImg: true } });
  states.forEach(s => addUrl(s.thumbImg));

  // Cities
  const cities = await prisma.city.findMany({ select: { thumbImg: true } });
  cities.forEach(c => addUrl(c.thumbImg));

  // Journeys
  const journeys = await prisma.journey.findMany({ select: { thumbImg: true } });
  journeys.forEach(j => addUrl(j.thumbImg));

  // TourPackages
  const packages = await prisma.tourPackage.findMany({ select: { bannerImageUrl: true } });
  packages.forEach(p => {
    if (p.bannerImageUrl && typeof p.bannerImageUrl === "object") {
      Object.values(p.bannerImageUrl).forEach(v => addUrl(v));
    }
  });

  // Users
  const users = await prisma.users.findMany({ select: { profileImage: true, bannerImage: true } });
  users.forEach(u => { addUrl(u.profileImage); addUrl(u.bannerImage); });

  // Vendors
  const vendors = await prisma.vendor.findMany({ select: { vendarProfileImage: true, vendarBannerImage: true } });
  vendors.forEach(v => { addUrl(v.vendarProfileImage); addUrl(v.vendarBannerImage); });

  // Invoices
  const invoices = await prisma.invoice.findMany({ select: { bannerImageUrl: true } });
  invoices.forEach(i => {
    if (i.bannerImageUrl && typeof i.bannerImageUrl === "object") {
      Object.values(i.bannerImageUrl).forEach(v => addUrl(v));
    }
  });

  console.log(`\n📊 Total URLs used in DB: ${usedUrls.size}`);

  // Normalize to filenames - support both absolute URLs and relative paths
  const usedFilenames = new Set(
    [...usedUrls]
      .filter(u => u.includes("/documents/"))
      .map(u => path.basename(u))
  );

  console.log(`📁 Filenames used from /documents: ${usedFilenames.size}`);

  // 2. List all files in public/documents
  if (!fs.existsSync(docPath)) {
    console.log("No documents folder found.");
    return;
  }

  const allFiles = fs.readdirSync(docPath).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);
  });

  console.log(`🗂  Total image files in /documents: ${allFiles.length}`);

  // 3. Find unused files
  const unusedFiles = allFiles.filter(f => !usedFilenames.has(f));
  console.log(`🗑  Unused files to delete: ${unusedFiles.length}`);

  if (unusedFiles.length === 0) {
    console.log("✅ No unused files found! Library is already clean.");
    return;
  }

  // 4. Dry run vs actual delete
  const dryRun = !process.argv.includes("--delete");

  if (dryRun) {
    console.log("\n📋 Preview — files that WILL be deleted (run with --delete to actually delete):");
    let totalSize = 0;
    unusedFiles.forEach(f => {
      const size = fs.statSync(path.join(docPath, f)).size;
      totalSize += size;
      console.log(`  - ${f}  (${(size / 1024).toFixed(1)} KB)`);
    });
    console.log(`\n💾 Total space to be freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log("\n▶  Run: node --env-file=.env cleanup_unused_images.mjs --delete");
  } else {
    console.log("\n🗑  Deleting unused files...");
    let deleted = 0, failed = 0;
    for (const f of unusedFiles) {
      try {
        fs.unlinkSync(path.join(docPath, f));
        console.log(`  ✅ Deleted: ${f}`);
        deleted++;
      } catch (err) {
        console.log(`  ❌ Failed: ${f} — ${err.message}`);
        failed++;
      }
    }
    console.log(`\n✅ Done! Deleted ${deleted} files, ${failed} failed.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
