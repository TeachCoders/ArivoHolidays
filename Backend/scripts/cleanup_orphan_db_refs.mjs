// Script to remove DB references to image files that no longer exist on disk
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
const publicPath = path.join(__dirname, "public");
const dryRun = !process.argv.includes("--fix");

// Check if a URL points to a file that exists on disk
function fileExists(url) {
  if (!url || typeof url !== "string") return true; // not a local file, skip
  
  // Only check localhost/local URLs
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  
  let relativePath = null;
  if (url.startsWith(baseUrl)) {
    relativePath = url.slice(baseUrl.length);
  } else if (url.startsWith("/") && !url.startsWith("//")) {
    relativePath = url;
  } else {
    return true; // external URL, don't touch
  }
  
  const fullPath = path.join(publicPath, relativePath);
  return fs.existsSync(fullPath);
}

async function main() {
  console.log(`\n🔍 Scanning DB for broken image references...`);
  console.log(dryRun ? "📋 DRY RUN mode (run with --fix to apply changes)\n" : "🛠  FIX mode — changes will be applied\n");

  const changes = [];

  // ── Banners ──────────────────────────────────────────────────────
  const banners = await prisma.banner.findMany();
  for (const banner of banners) {
    const valid = (banner.images || []).filter(url => fileExists(url));
    const removed = (banner.images || []).filter(url => !fileExists(url));
    if (removed.length > 0) {
      changes.push({ type: "Banner", id: banner.id, field: "images", removed, newValue: valid });
      if (!dryRun) {
        await prisma.banner.update({ where: { id: banner.id }, data: { images: valid } });
      }
    }
  }

  // ── Country thumbImg ─────────────────────────────────────────────
  const countries = await prisma.country.findMany({ select: { id: true, title: true, thumbImg: true } });
  for (const c of countries) {
    if (c.thumbImg && !fileExists(c.thumbImg)) {
      changes.push({ type: "Country", id: c.id, title: c.title, field: "thumbImg", removed: [c.thumbImg], newValue: null });
      if (!dryRun) await prisma.country.update({ where: { id: c.id }, data: { thumbImg: null } });
    }
  }

  // ── State thumbImg ───────────────────────────────────────────────
  const states = await prisma.state.findMany({ select: { id: true, title: true, thumbImg: true } });
  for (const s of states) {
    if (s.thumbImg && !fileExists(s.thumbImg)) {
      changes.push({ type: "State", id: s.id, title: s.title, field: "thumbImg", removed: [s.thumbImg], newValue: null });
      if (!dryRun) await prisma.state.update({ where: { id: s.id }, data: { thumbImg: null } });
    }
  }

  // ── City thumbImg ────────────────────────────────────────────────
  const cities = await prisma.city.findMany({ select: { id: true, title: true, thumbImg: true } });
  for (const c of cities) {
    if (c.thumbImg && !fileExists(c.thumbImg)) {
      changes.push({ type: "City", id: c.id, title: c.title, field: "thumbImg", removed: [c.thumbImg], newValue: null });
      if (!dryRun) await prisma.city.update({ where: { id: c.id }, data: { thumbImg: null } });
    }
  }

  // ── Journey thumbImg ─────────────────────────────────────────────
  const journeys = await prisma.journey.findMany({ select: { id: true, title: true, thumbImg: true } });
  for (const j of journeys) {
    if (j.thumbImg && !fileExists(j.thumbImg)) {
      changes.push({ type: "Journey", id: j.id, title: j.title, field: "thumbImg", removed: [j.thumbImg], newValue: null });
      if (!dryRun) await prisma.journey.update({ where: { id: j.id }, data: { thumbImg: null } });
    }
  }

  // ── Users profileImage / bannerImage ─────────────────────────────
  const users = await prisma.users.findMany({ select: { id: true, name: true, profileImage: true, bannerImage: true } });
  for (const u of users) {
    if (u.profileImage && !fileExists(u.profileImage)) {
      changes.push({ type: "User", id: u.id, title: u.name, field: "profileImage", removed: [u.profileImage], newValue: null });
      if (!dryRun) await prisma.users.update({ where: { id: u.id }, data: { profileImage: null } });
    }
    if (u.bannerImage && !fileExists(u.bannerImage)) {
      changes.push({ type: "User", id: u.id, title: u.name, field: "bannerImage", removed: [u.bannerImage], newValue: null });
      if (!dryRun) await prisma.users.update({ where: { id: u.id }, data: { bannerImage: null } });
    }
  }

  // ── Vendors ──────────────────────────────────────────────────────
  const vendors = await prisma.vendor.findMany({ select: { id: true, vendarCompanyName: true, vendarProfileImage: true, vendarBannerImage: true } });
  for (const v of vendors) {
    if (v.vendarProfileImage && !fileExists(v.vendarProfileImage)) {
      changes.push({ type: "Vendor", id: v.id, title: v.vendarCompanyName, field: "vendarProfileImage", removed: [v.vendarProfileImage], newValue: null });
      if (!dryRun) await prisma.vendor.update({ where: { id: v.id }, data: { vendarProfileImage: null } });
    }
    if (v.vendarBannerImage && !fileExists(v.vendarBannerImage)) {
      changes.push({ type: "Vendor", id: v.id, title: v.vendarCompanyName, field: "vendarBannerImage", removed: [v.vendarBannerImage], newValue: null });
      if (!dryRun) await prisma.vendor.update({ where: { id: v.id }, data: { vendarBannerImage: null } });
    }
  }

  // ── Results ──────────────────────────────────────────────────────
  if (changes.length === 0) {
    console.log("✅ No broken references found! Database is clean.");
    return;
  }

  console.log(`⚠️  Found ${changes.length} broken reference(s):\n`);
  for (const c of changes) {
    console.log(`  [${c.type} #${c.id}] ${c.title || ""} → field: "${c.field}"`);
    c.removed.forEach(url => console.log(`    ❌ Missing file: ${url}`));
  }

  if (dryRun) {
    console.log(`\n▶  Run: node --env-file=.env cleanup_orphan_db_refs.mjs --fix`);
  } else {
    console.log(`\n✅ Done! Cleaned ${changes.length} broken reference(s) from DB.`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
