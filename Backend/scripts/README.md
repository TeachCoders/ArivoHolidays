# Backend Scripts

Sab scripts **`Backend/` se run karein** (relative imports + `dotenv/config` cwd par depend karte hain):

```bash
cd Backend
node scripts/<script-name>.js
```

> Debug scripts ko `debug-*.js` naam diya gaya hai taaki `npm test` (auto-discovery) inhe test samajh kar na chalaaye. Tests sirf `tests/` folder me hain.

Scripts seedha DB pe kaam karte hain — **production par chalane se pehle saavadhaani** (koi rollback nahi).

## Categories

### Ops / Backup (maintenance-safe)
| Script | Kaam |
|---|---|
| `backup-db.sh` | `pg_dump` → `backups/backup-<timestamp>.sql` (last 14 rakhta hai) |
| `restore-db.sh <file.sql>` | Backup restore (confirmation maangta hai, DB drop/overwrite karta hai) |
| `fix_image_urls.mjs` | DB ke image URLs me `localhost` → production `BASE_URL` (dry-run by default, `--apply` se likhta hai) |
| `move_quotation_pdfs.mjs` | Purane quotation PDFs ko `public/quotations/` me move karta hai |

### Seed / Setup
`createSuperAdmin.js`, `seed_months.mjs`, `populateCityContent.js`, `populateJourneyItineraries.js`, `populateCanonicalUrls.js`, `generate_plan.js`, `generate_state_plan.js`, `merge_plan.js`

### Check / Read-only (DB inspect)
`check_*.js`, `get_*.js`, `query_banners.js`, `extract_seo.js` / `extract_seo.mjs`, `debug-api.js`, `debug-lead.js`, `debug-email.js`

### Fix / Update (data modification — aware rahein)
`fix_*.js`, `update_*.js`, `append_*.js`, `add_india_to_tags.js`, `randomize_overviews.js`, `backfill_media.mjs`, `cleanup_*.mjs`, `smart_rename_documents.mjs`, `optimize-images.js`, `sendPastEmails.js`

---

**Note:** Inme se kai scripts **ek-baar ke (one-off)** the — kisi aur kaam ke liye kabhi pakka sure hokar hi chalaayein. Purane/unused scripts future me archive karke `scripts/archive/` me daalna chahiye.
