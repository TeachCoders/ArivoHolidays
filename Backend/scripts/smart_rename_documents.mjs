// Smart rename: move referenced public/documents/* files into public/content/
// with meaningful names (<entity-slug>-holiday-N.webp / <city-slug>-thumb.webp),
// update Banner.images + City.thumbImg references, and register them in Media.
//
// Usage:
//   node smart_rename_documents.mjs            → dry-run (prints plan, changes nothing)
//   node smart_rename_documents.mjs --apply    → performs the rename + DB updates
import 'dotenv/config';
import { createRequire } from 'module';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const gen = require('./generated/prisma/index.js');
const PrismaClient = gen.PrismaClient ?? gen.default?.PrismaClient ?? gen.default ?? gen;
const { PrismaPg } = require('@prisma/adapter-pg');
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APPLY = process.argv.includes("--apply");
const baseUrl = process.env.BASE_URL || "http://localhost:5000";

const oldToUrl = (file) => `${baseUrl}/documents/${file}`;
const newToUrl = (name) => `${baseUrl}/content/${name}`;

const entityCache = {};
async function getSlug(entityType, entityId) {
  const key = `${entityType}:${entityId}`;
  if (entityCache[key]) return entityCache[key];
  let slug = null;
  const model = prisma[entityType.toLowerCase()] || prisma[entityType];
  if (model) {
    const row = await model.findUnique({ where: { id: entityId }, select: { slug: true } });
    slug = row?.slug ?? null;
  }
  entityCache[key] = slug;
  return slug;
}

async function main() {
  const docPath = path.join(__dirname, "public", "documents");
  const contentPath = path.join(__dirname, "public", "content");
  if (!fs.existsSync(contentPath)) fs.mkdirSync(contentPath, { recursive: true });

  const refsByFile = new Map(); // oldFile -> [{bannerId, entityType, entityId, idx} | {cityId, citySlug}]

  const allBanners = await prisma.banner.findMany({
    select: { id: true, images: true, entityType: true, entityId: true },
  });
  const banners = allBanners.filter((b) => b.images.some((i) => i.includes("/documents/")));
  let bannerRefCount = 0;
  for (const b of banners) {
    b.images.forEach((img, idx) => {
      const m = img.match(/\/documents\/([^/?#]+)/);
      if (m) {
        bannerRefCount++;
        if (!refsByFile.has(m[1])) refsByFile.set(m[1], []);
        refsByFile.get(m[1]).push({ bannerId: b.id, entityType: b.entityType, entityId: b.entityId, idx });
      }
    });
  }

  const cities = await prisma.city.findMany({
    where: { thumbImg: { contains: "/documents/" } },
    select: { id: true, slug: true, thumbImg: true },
  });
  for (const c of cities) {
    const m = c.thumbImg.match(/\/documents\/([^/?#]+)/);
    if (m) {
      if (!refsByFile.has(m[1])) refsByFile.set(m[1], []);
      refsByFile.get(m[1]).push({ cityId: c.id, citySlug: c.slug });
    }
  }

  console.log(`Refs: ${bannerRefCount} banner + ${cities.length} city thumb, unique files: ${refsByFile.size}\n`);

  // Resolve target names (collision-safe)
  const usedNames = new Set();
  const plans = []; // { oldFile, newName, oldPath, newPath, refs }
  let missing = 0, collisions = 0;

  for (const [oldFile, refs] of refsByFile) {
    const oldPath = path.join(docPath, oldFile);
    if (!fs.existsSync(oldPath)) {
      console.log(`MISSING (skip): ${oldFile}`);
      missing++;
      continue;
    }

    const ext = path.extname(oldFile).toLowerCase() || ".webp";
    let candidate = null;

    const cityRef = refs.find((r) => r.citySlug);
    if (cityRef) {
      const base = cityRef.citySlug;
      if (oldFile.replace(/\.[^.]+$/, "") === base) {
        candidate = oldFile; // already well-named (e.g. fatehpur-sikri.webp)
      } else {
        candidate = `${base}-thumb${ext}`;
      }
    }
    if (!candidate) {
      const bRef = refs[0];
      const slug = await getSlug(bRef.entityType, bRef.entityId);
      if (!slug) {
        console.log(`NO SLUG (skip): ${oldFile} -> ${bRef.entityType}/${bRef.entityId}`);
        continue;
      }
      candidate = `${slug}-holiday-${bRef.idx + 1}${ext}`;
    }

    let finalName = candidate;
    let counter = 2;
    while (usedNames.has(finalName)) {
      finalName = `${path.basename(candidate, ext)}-${counter}${ext}`;
      counter++;
    }
    if (finalName !== candidate) collisions++;
    usedNames.add(finalName);

    plans.push({ oldFile, newName: finalName, oldPath, newPath: path.join(contentPath, finalName), refs });
  }

  console.log(`Planned moves: ${plans.length}, missing: ${missing}, collision-renamed: ${collisions}\n`);
  for (const p of plans) {
    console.log(`  documents/${p.oldFile}  ->  content/${p.newName}`);
  }

  // Banner / City changes
  const bannerChanges = new Map(); // bannerId -> [{from, to}]
  const cityChanges = new Map();   // cityId -> {from, to}
  for (const p of plans) {
    const to = newToUrl(p.newName);
    for (const r of p.refs) {
      if (r.cityId) {
        const from = oldToUrl(p.oldFile);
        cityChanges.set(r.cityId, { from, to });
      } else {
        const from = oldToUrl(p.oldFile);
        if (!bannerChanges.has(r.bannerId)) bannerChanges.set(r.bannerId, []);
        bannerChanges.get(r.bannerId).push({ from, to });
      }
    }
  }
  console.log(`Banners to update: ${bannerChanges.size}, Cities to update: ${cityChanges.size}`);

  if (!APPLY) {
    console.log("\n[DRY-RUN] No changes made. Re-run with --apply to execute.");
    await prisma.$disconnect();
    return;
  }

  // 1. Move files
  let moved = 0;
  for (const p of plans) {
    if (!fs.existsSync(p.oldPath)) continue;
    fs.mkdirSync(path.dirname(p.newPath), { recursive: true });
    fs.renameSync(p.oldPath, p.newPath);
    moved++;
  }
  console.log(`Moved ${moved} file(s).`);

  // 2. Update Banner.images
  for (const [bannerId, subs] of bannerChanges) {
    const banner = await prisma.banner.findUnique({ where: { id: bannerId } });
    if (!banner) continue;
    const images = banner.images.map((img) => {
      let out = img;
      for (const s of subs) if (out === s.from) out = s.to;
      return out;
    });
    await prisma.banner.update({ where: { id: bannerId }, data: { images } });
  }
  console.log(`Updated ${bannerChanges.size} banner(s).`);

  // 3. Update City.thumbImg
  for (const [cityId, s] of cityChanges) {
    const city = await prisma.city.findUnique({ where: { id: cityId } });
    if (!city || city.thumbImg !== s.from) continue;
    await prisma.city.update({ where: { id: cityId }, data: { thumbImg: s.to } });
  }
  console.log(`Updated ${cityChanges.size} city thumb(s).`);

  // 4. Register in Media (folder=content)
  let mediaCreated = 0;
  for (const p of plans) {
    const url = newToUrl(p.newName);
    const existing = await prisma.media.findUnique({ where: { url } });
    if (!existing) {
      await prisma.media.create({ data: { filename: p.newName, url, folder: "content", label: p.newName, category: "banner" } });
      mediaCreated++;
    }
  }
  console.log(`Media records created: ${mediaCreated}`);

  // 5. Verify no /documents/ references remain
  const all = await prisma.banner.findMany({ select: { id: true, images: true } });
  const left = all.filter((b) => b.images.some((i) => i.includes("/documents/"))).length;
  const leftCity = await prisma.city.count({ where: { thumbImg: { contains: "/documents/" } } });
  console.log(`Remaining /documents/ refs — banners: ${left}, cities: ${leftCity}`);
  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
