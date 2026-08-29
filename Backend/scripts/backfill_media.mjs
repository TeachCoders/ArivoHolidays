// Backfill: register existing public/ content images into the Media table.
// Skips documents/ and user/ (kept hidden). Idempotent — URLs already present are skipped.
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

const HIDDEN_FOLDERS = new Set(["documents", "user"]);
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:5000";
  const publicPath = path.join(__dirname, "public");

  const files = [];
  const scanDir = (dir, relativePath = "") => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        if (!HIDDEN_FOLDERS.has(entry.name)) {
          scanDir(path.join(dir, entry.name), entryRelative);
        }
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTS.has(ext)) {
          files.push({ filename: entry.name, folder: relativePath, relPath: entryRelative });
        }
      }
    }
  };
  scanDir(publicPath);

  console.log(`Found ${files.length} content image(s)`);
  let created = 0, skipped = 0;

  for (const f of files) {
    const url = `${baseUrl}/${f.relPath}`;
    const existing = await prisma.media.findUnique({ where: { url } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.media.create({
      data: {
        filename: f.filename,
        url,
        folder: f.folder || "content",
        label: f.filename,
      },
    });
    created++;
  }

  console.log(`Done: ${created} created, ${skipped} already present.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
