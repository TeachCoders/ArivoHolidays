// Backfill: optimize existing images in public/ in-place (same filename/path preserved for SEO)
// - Resize any image wider than 1920px (no enlargement)
// - Recompress raster images (jpeg/png/gif/webp) to WebP quality 80
// - Skips SVG/PDF and files already small enough (< 200KB) to avoid unnecessary quality loss
// Usage: node scripts/optimize-images.js [publicRoot]
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(process.argv[2] || path.join(__dirname, "..", "public"));
const MAX_WIDTH = 1920;
const QUALITY = 80;
const MIN_SIZE_TO_RECOMPRESS = 200 * 1024; // 200KB
const PROCESSABLE_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

let scanned = 0;
let skipped = 0;
let optimized = 0;
let failed = 0;
let totalSaved = 0;

// State file records (path -> signature) of already-processed files so re-runs
// never re-encode (avoids quality loss). Signature = size + mtimeMs + width.
const STATE_FILE = path.join(PUBLIC_ROOT, ".image-optimize-state.json");
const state = {};
if (fs.existsSync(STATE_FILE)) {
  try {
    Object.assign(state, JSON.parse(fs.readFileSync(STATE_FILE, "utf8")));
  } catch {
    // corrupted state — start fresh
  }
}
const dirtyState = {};

function fileSignature(absPath, width) {
  const stat = fs.statSync(absPath);
  return `${stat.size}|${Math.floor(stat.mtimeMs)}|${width}`;
}

async function processFile(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  if (!PROCESSABLE_EXTS.includes(ext)) return;
  if (path.basename(absPath).startsWith(".")) return;

  scanned++;
  const beforeSize = fs.statSync(absPath).size;

  try {
    const meta = await sharp(absPath).metadata();
    const width = meta.width || 0;

    // Already processed and unchanged → skip
    const sig = fileSignature(absPath, width);
    if (state[absPath] === sig) {
      skipped++;
      return;
    }

    // Skip if it's already fine (small file and within width)
    if (width <= MAX_WIDTH && beforeSize < MIN_SIZE_TO_RECOMPRESS) {
      dirtyState[absPath] = sig;
      skipped++;
      return;
    }

    // Process to a temp file, then atomically replace (keeps exact filename)
    const tempPath = `${absPath}.tmp-${process.pid}.webp`;
    await sharp(absPath)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(tempPath);

    const afterSize = fs.statSync(tempPath).size;

    // Only replace if the result is actually smaller (never grow a file)
    if (afterSize < beforeSize) {
      fs.renameSync(tempPath, absPath);
      totalSaved += beforeSize - afterSize;
      optimized++;
      const newMeta = await sharp(absPath).metadata();
      dirtyState[absPath] = fileSignature(absPath, newMeta.width || 0);
      console.log(`  ✓ ${path.relative(PUBLIC_ROOT, absPath)}  ${formatKB(beforeSize)} → ${formatKB(afterSize)}`);
    } else {
      fs.unlinkSync(tempPath);
      dirtyState[absPath] = sig;
      skipped++;
      console.log(`  - ${path.relative(PUBLIC_ROOT, absPath)}  already optimal (${formatKB(beforeSize)})`);
    }
  } catch (err) {
    failed++;
    console.error(`  ✗ ${path.relative(PUBLIC_ROOT, absPath)}: ${err.message}`);
  }
}

function collectFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("node_modules") || entry.name.startsWith(".git")) continue;
      collectFiles(absPath, out);
    } else if (entry.isFile()) {
      out.push(absPath);
    }
  }
  return out;
}

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(1)}KB`;
}

if (!fs.existsSync(PUBLIC_ROOT)) {
  console.error(`Directory not found: ${PUBLIC_ROOT}`);
  process.exit(1);
}

console.log(`Scanning ${PUBLIC_ROOT} ...\n`);
const files = collectFiles(PUBLIC_ROOT, []);

for (const absPath of files) {
  await processFile(absPath);
}

console.log(`
Done.
  Scanned : ${scanned}
  Optimized: ${optimized}
  Skipped : ${skipped}
  Failed  : ${failed}
  Saved   : ${formatKB(totalSaved)} total
`);

// Persist state so a re-run does not re-encode unchanged files
try {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ ...state, ...dirtyState }, null, 2));
  console.log(`State saved → ${path.relative(PUBLIC_ROOT, STATE_FILE)}`);
} catch (err) {
  console.error("Failed to save state:", err.message);
}
