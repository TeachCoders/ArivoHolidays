# Deploy — Arivo Holidays (Production)

Final stack decided:

| Cheez | Kahan | Cost |
|---|---|---|
| **Database (PostgreSQL)** | Supabase (FREE, Mumbai region) | ₹0 |
| **Images/PDF (public)** | Supabase Storage (FREE 1GB bucket) | ₹0 |
| **Private docs** (passports/payment slips) | VPS disk + backup | — |
| **VPS (app)** | BigRock 4GB VPS (2-saal) | ~₹9,884 |
| **Domain** | BigRock `arivoholidays.in` | ~₹299/sal |
| **Code** | Aapki git repo | git me |

> **Bahut zaroori rule:** images ka URL **Supabase public bucket** se aata hai (permanent,
> sab jagah khulne wala). Passports/payment slips **kabhi** public bucket me nahi —
> wo VPS par protected + backup.

---

## Step 0 — Purchases

1. **Supabase** — `supabase-setup.md` follow karo (free: DB + Storage + keys). Database connection string me `?sslmode=require`.
2. **BigRock VPS** — India Budget ya NVMe 4 profile, 4GB RAM, Ubuntu 24.04 OS select. 24-mahina (2-saal) term.
3. **Domain** `arivoholidays.in` (BigRock se).

VPS milte hi niche se shuru karo.

---

## 📒 Notebook Copy — POORA COMMAND LIST (order me)

> Har command apne system (office ya personal) se chal sakti hai — sab `ssh` se hota hai.
> `<SERVER_IP>` = VPS ka IP, `<REPO_URL>` = aapki git repo.

```bash
# ── 1. VPS SETUP (1 baar) ──────────────────────────────
ssh root@<SERVER_IP>
apt update && apt install -y curl
# setup-vps.sh ke top par REPO_URL set karo, phir:
bash setup-vps.sh
#    → Node 20 + PM2 + Nginx + certbot + UFW + repo clone

# ── 2. .env FILES (hamesha ke liye) ────────────────────
nano /opt/arivo/app/Backend/.env
#   → DATABASE_URL (Supabase) / SESSION_SECRET / CSRF_SECRET /
#     BASE_URL=https://api.arivoholidays.com / CORS_ORIGIN=https://arivoholidays.com /
#     SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / STORAGE_BACKEND=supabase /
#     EMAIL_ID+EMAIL_PASSWORD (Gmail app password) / OWNER_EMAIL / CHAT_PARTNER_NUMBER
nano /opt/arivo/app/frontend/.env
#   → NEXT_PUBLIC_API_BASE_URL=https://api.arivoholidays.com /
#     API_BASE_URL=https://api.arivoholidays.com /
#     NEXT_PUBLIC_SITE_URL=https://arivoholidays.com

# ── 3. DEPLOY (har badlaav par) ────────────────────────
bash /opt/arivo/app/deploy/deploy-app.sh
#    → migrate + build + PM2 + nginx + SSL

# ── 4. DNS (BigRock panel) ─────────────────────────────
#   A  arivoholidays.com  → <SERVER_IP>
#   A  api.arivoholidays.com → <SERVER_IP>
#   A  www               → <SERVER_IP>

# ── 5. SSL (DNS point hone ke baad, 1 baar) ────────────
certbot --nginx -d arivoholidays.com -d www.arivoholidays.com -d api.arivoholidays.com --redirect --agree-tos -m aap@email.com

# ── 6. BACKUP (cron auto) ──────────────────────────────
bash /opt/arivo/app/deploy/backup.sh
#   cron: 0 3 * * * bash /opt/arivo/app/deploy/backup.sh >> /var/log/arivo-backup.log 2>&1

# ── 7. ROJ-GO USE ──────────────────────────────────────
pm2 logs arivo-backend          # backend log
pm2 logs arivo-frontend         # frontend log
pm2 restart all                 # restart
curl https://api.arivoholidays.com/health   # health check
```

Security note: root password login band karo (setup me SSH key hi kafi), UFW 22/80/443.

---

## Step 1 — Server setup (1 baar)

SSH root login:

```bash
ssh root@<SERVER_IP>
apt install -y curl
bash <(curl -s https://<aapka-git-raw>/deploy/setup-vps.sh)
```

Ya file local copy kar ke:

```bash
scp deploy/setup-vps.sh root@<SERVER_IP>:/tmp/
ssh root@<SERVER_IP> "bash /tmp/setup-vps.sh"
```

Setup script (`deploy/setup-vps.sh`):
- Ubuntu update + Node 20 + PM2 + Nginx + Certbot + firewall (22/80/443)
- **Private repo**: pehli baar ek SSH deploy key banata hai → us public key ko
  GitHub → repo → Settings → Deploy keys par paste karo → script **dobara** chalao
- Repo clone karta hai `/opt/arivo/app`
- `.env` `example` → `.env` copy hota hai (baad me edit karna)

> Setup script vars (start me): `REPO_URL` (private ho to `git@github.com:you/repo.git`), `GIT_BRANCH`.

---

## Step 2 — .env files bharo

`/opt/arivo/app/Backend/.env` aur `/opt/arivo/app/frontend/.env` — `.env.example` ke hisaab se sab values bharo.

Backend `.env` production me yeh badalna:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres.<ref>:<PASSWORD>@db.<ref>.supabase.co:5432/postgres?sslmode=require
BASE_URL=https://api.arivoholidays.com
CORS_ORIGIN=https://arivoholidays.com
SITE_URL=https://arivoholidays.com
BOOKING_PORTAL_URL=https://booking.arivoholidays.com
SESSION_SECRET=<random 96 hex chars>
CSRF_SECRET=<random 96 hex chars> (SESSION_SECRET se alag rakho)
SEED_ADMIN_EMAIL=...
SEED_ADMIN_PASSWORD=...
OWNER_EMAIL=... OWNER_MOBILE=... SALES_MOBILE=...
CHAT_PARTNER_NUMBER=...

# Supabase Storage (images → cloud)
STORAGE_BACKEND=supabase
SUPABASE_URL=https://khgopfgebkkdlnwwoanx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi... (service_role, secret!)
```

Frontend `.env`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.arivoholidays.com
API_BASE_URL=https://api.arivoholidays.com
NEXT_PUBLIC_SITE_URL=https://arivoholidays.com
NEXT_PUBLIC_WHATSAPP_NUMBER=...
NEXT_PUBLIC_SALES_PHONE=...
```

> ⚠️ Frontend env build time me bake hota hai — galat value dalo to `deploy-app.sh` phir build karna padega.

## Step 3 — Deploy (migrate + build + start)

```bash
ssh root@<SERVER_IP> "bash /opt/arivo/app/deploy/deploy-app.sh"
```

Ye karega:
- `prisma migrate deploy` (Supabase par tables banate)
- Frontend production build
- PM2 start (backend :5000 + frontend :3000)
- Nginx conf generate
- Certbot SSL (domain ready ho to)

## Step 3b — First boot extras

Pehli baar declare hui ek cheez: **uptime monitor**.
Live hote hi `https://api.arivoholidays.com/health` link kisi free monitor
(UptimeRobot/Uptime Kuma) par add kar lo — internet down ya server fail hone par email/WhatsApp alert milega.

## Step 3c — Seed images (finished)

Seed images `/destinationImage/...` repo me committed hain → **git clone ke saath
automatically VPS par aa jayengi**, alag se upload nahi karni. Bas first deploy ke baad
seed command chalao (agar repo me seed script hai) — README ke "seeds" section jaisa.

## Step 4 — DNS

BigRock se domain DNS:
- `A  arivoholidays.com  -> <SERVER_IP>`
- `A  api.arivoholidays.com  -> <SERVER_IP>`
- `CNAME  www  -> arivoholidays.com` (optional)

Cloudflare free (optional): nameservers change karke CDN + HTTPS bhi mil jata hai — international tourists ke liye fast.

## Step 5 — Backups

```bash
ssh root@<SERVER_IP> "bash /opt/arivo/deploy/backup.sh"
```

Cron add karo (root `crontab -e`):

```
0 3 * * * root bash /opt/arivo/deploy/backup.sh >> /var/log/arivo-backup.log 2>&1
```

Backup = Supabase DB dump (pg_dump, TLS) + VPS disk `Backend/public` ka tar.
Note: public images Supabase Storage me hain (backup DB se pata chalta hai), private docs VPS par tar me hai.
Offsite ke liye rclone setup (`rclone config`) karke `backup.sh` me `RCLONE_DEST` bharo (Google Drive free 15GB).

---

## Migration (BigRock → Hostinger, jab business chale)

`migrate.sh` padho. Asli tarika:
1. Purane server par: `backup.sh` chalao (DB + uploads ka single archive milta hai `Backend/backups/`)
2. Naya server (Hostinger): setup-vps.sh + deploy-app.sh chalao (repos dosre-naye repo se parsed)
3. Supabase DB **wapas data nahi transfer** karna — data pehle se Supabase me hai. Sirf uploads copy hote hain.
4. DNS point karo → 30 min me live.

---

## Tips

- **Kisi bhi samay restart:** `pm2 restart all`
- **Logs:** `pm2 logs arivo-backend`
- **Uptime monitor:** `http://api.arivoholidays.com/health` (README ke Uptime Kuma section jaise)
- Security: root SSH password login band (setup par key use karo), UFW sirf 22/80/443.