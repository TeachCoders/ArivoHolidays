// Move quotation PDFs from public/documents/ → public/quotations/
// After this change, /documents/ is auth-only (passports, govt IDs, payment slips)
// while /quotations/ stays public so travellers can download their quotation
// from the WhatsApp/email link without logging in.
//
// Usage: node scripts/move_quotation_pdfs.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(process.argv[2] || path.join(__dirname, "..", "public"));
const SRC_DIR = path.join(PUBLIC_ROOT, "documents");
const DEST_DIR = path.join(PUBLIC_ROOT, "quotations");

if (!fs.existsSync(SRC_DIR)) {
  console.log("No documents/ folder found — nothing to move.");
  process.exit(0);
}

if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter((f) => f.toLowerCase().startsWith("quotation-") && f.toLowerCase().endsWith(".pdf"));
let moved = 0;
let failed = 0;

for (const file of files) {
  const src = path.join(SRC_DIR, file);
  const dest = path.join(DEST_DIR, file);
  try {
    fs.renameSync(src, dest);
    moved++;
    console.log(`Moved: ${file}`);
  } catch (err) {
    failed++;
    console.error(`Failed to move ${file}:`, err.message);
  }
}

console.log(`\nDone. Moved ${moved} quotation PDF(s) to public/quotations/ (${failed} failed).`);
