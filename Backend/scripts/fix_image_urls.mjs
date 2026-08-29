// One-time migration: rewrite dev image URLs (http://localhost:5000/...) stored in the
// database to the production BASE_URL so existing media keeps working after deploy.
//
// Usage:
//   OLD_BASE_URL=http://localhost:5000 BASE_URL=https://api.arivoholidays.com node scripts/fix_image_urls.mjs          # dry-run (no writes)
//   OLD_BASE_URL=http://localhost:5000 BASE_URL=https://api.arivoholidays.com node scripts/fix_image_urls.mjs --apply  # writes
//
// Idempotent: only rows containing OLD_BASE_URL are touched. Run twice safely.
import "dotenv/config";
import { prisma } from "../utils/prismaConnection.js";

const APPLY = process.argv.includes("--apply");
const OLD_BASE = (process.env.OLD_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
const NEW_BASE = (process.env.BASE_URL || "").replace(/\/$/, "");

if (!NEW_BASE) {
  console.error("BASE_URL env var is required (e.g. https://api.arivoholidays.com)");
  process.exit(1);
}

const oldPrefix = OLD_BASE;
const newPrefix = NEW_BASE;
console.log(`Mode: ${APPLY ? "APPLY (writes)" : "DRY-RUN (no writes)"}`);
console.log(`Rewriting: ${oldPrefix} → ${newPrefix}\n`);

let totalChanged = 0;

const rewriteString = (v) => (typeof v === "string" && v.includes(oldPrefix) ? v.split(oldPrefix).join(newPrefix) : v);

const rewriteDeep = (v) => {
  if (typeof v === "string") return rewriteString(v);
  if (Array.isArray(v)) return v.map(rewriteDeep);
  if (v && typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) out[k] = rewriteDeep(val);
    return out;
  }
  return v;
};

// Simple string fields (direct column values)
const STRING_FIELDS = {
  country: ["thumbImg"],
  state: ["thumbImg"],
  city: ["thumbImg"],
  month: ["thumbImg"],
  travelExperience: ["thumbImg"],
  journey: ["thumbImg"],
  journeyDay: ["image"],
  cmsPage: ["thumbImg"],
  blogPost: ["thumbImg"],
  users: ["profileImage", "bannerImage"],
  vendor: ["vendarProfileImage", "vendarBannerImage"],
  travellerDocument: ["passportUrl", "govtIdUrl"],
  payment: ["paymentScreenshotUrl"],
  media: ["url"],
};

// HTML content fields — images may be embedded in the HTML markup
const HTML_FIELDS = {
  country: ["overView", "moreDescription", "seoDescription"],
  state: ["overView", "moreDescription", "seoDescription"],
  city: ["overView", "moreDescription", "seoDescription"],
  month: ["overView", "moreDescription", "seoDescription"],
  travelExperience: ["overView", "moreDescription", "seoDescription"],
  journey: ["overView", "moreDescription", "seoDescription"],
  cmsPage: ["seoDescription", "moreDescription"],
  blogPost: ["seoDescription", "moreDescription"],
};

// JSON/JSONB fields — deep-rewrite any strings nested inside
const JSON_FIELDS = {
  banner: ["images"],
  tourPackage: ["bannerImageUrl", "itinerary", "hotelDetails", "carDetails", "guideDetails"],
  journey: ["hotelDetails", "carDetails", "guideDetails"],
  invoice: ["bannerImageUrl", "itinerary"],
  country: ["activeSnapshot"],
  state: ["activeSnapshot"],
  city: ["activeSnapshot"],
  month: ["activeSnapshot"],
  travelExperience: ["activeSnapshot"],
};

async function migrateStringFields() {
  for (const [model, fields] of Object.entries(STRING_FIELDS)) {
    for (const field of fields) {
      const rows = await prisma[model].findMany({
        where: { [field]: { contains: oldPrefix } },
        select: { id: true, [field]: true },
      });
      let changed = 0;
      for (const row of rows) {
        const next = rewriteString(row[field]);
        if (next === row[field]) continue;
        changed++;
        if (APPLY) {
          await prisma[model].update({ where: { id: row.id }, data: { [field]: next } });
        }
      }
      totalChanged += changed;
      if (changed) console.log(`${model}.${field}: ${changed} row(s)`);
    }
  }
}

async function migrateHtmlFields() {
  for (const [model, fields] of Object.entries(HTML_FIELDS)) {
    for (const field of fields) {
      const rows = await prisma[model].findMany({
        where: { [field]: { contains: oldPrefix } },
        select: { id: true, [field]: true },
      });
      let changed = 0;
      for (const row of rows) {
        const next = rewriteString(row[field]);
        if (next === row[field]) continue;
        changed++;
        if (APPLY) {
          await prisma[model].update({ where: { id: row.id }, data: { [field]: next } });
        }
      }
      totalChanged += changed;
      if (changed) console.log(`${model}.${field} (HTML): ${changed} row(s)`);
    }
  }
}

async function migrateJsonFields() {
  for (const [model, fields] of Object.entries(JSON_FIELDS)) {
    for (const field of fields) {
      const rows = await prisma[model].findMany({
        select: { id: true, [field]: true },
      });
      let changed = 0;
      for (const row of rows) {
        if (row[field] === null || row[field] === undefined) continue;
        if (!JSON.stringify(row[field]).includes(oldPrefix)) continue;
        const next = rewriteDeep(row[field]);
        if (JSON.stringify(next) === JSON.stringify(row[field])) continue;
        changed++;
        if (APPLY) {
          await prisma[model].update({ where: { id: row.id }, data: { [field]: next } });
        }
      }
      totalChanged += changed;
      if (changed) console.log(`${model}.${field} (JSON): ${changed} row(s)`);
    }
  }
}

try {
  await migrateStringFields();
  await migrateHtmlFields();
  await migrateJsonFields();
  console.log(`\nDone. ${totalChanged} row(s) would${APPLY ? "" : " be"} updated.`);
} catch (err) {
  console.error("Migration failed:", err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect().catch(() => {});
}
