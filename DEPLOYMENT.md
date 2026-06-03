# Deployment Checklist — Hostinger VPS (KVM 1 / KVM 2)

Production deploy guide for this Next.js 16 app. Built around the crash/availability
risks found in the audit. Work top to bottom; the **CRITICAL** items will take the
site down if skipped.

- **KVM 1** = 1 vCPU / 4 GB RAM — *use MongoDB Atlas, not a local mongod.*
- **KVM 2** = 2 vCPU / 8 GB RAM — local mongod is possible but Atlas is still simpler.

---

## 0. Stack overview

```
Internet ──► Nginx (TLS, reverse proxy, serves /uploads) ──► Node (next start / standalone) :3000
                                                              └─► MongoDB (Atlas, or local mongod)
```

Process is kept alive by **PM2** (or systemd). TLS terminates at Nginx.

---

## 1. CRITICAL — environment variables

Create `/var/www/devcourses/.env.local` on the server (never commit it). Set:

```bash
NODE_ENV=production                 # MUST be production — else payment dev-bypass enrolls buyers for free
NEXTAUTH_URL=https://yourdomain.com # your real https domain (not localhost)
AUTH_TRUST_HOST=true                # required behind Nginx (also hard-coded in lib/auth.config.ts)
NEXTAUTH_SECRET=<openssl rand -base64 32>

MONGODB_URI=<atlas connection string>

BULKSMS_API_KEY=...
BULKSMS_SENDER_ID=...

# EPS — LIVE values for production
EPS_BASE_URL=https://pgapi.eps.com.bd      # sandbox.eps.com.bd is for testing only
EPS_USERNAME=...
EPS_PASSWORD=...
EPS_HASH_KEY=...
EPS_MERCHANT_ID=...
EPS_STORE_ID=...
EPS_TRANSACTION_TYPE_ID=1
EPS_CANCEL_URL=https://yourdomain.com/courses

# Meta (optional)
NEXT_PUBLIC_META_PIXEL_ID=...
META_CAPI_ACCESS_TOKEN=...

RESEND_API_KEY=...
```

> ⚠️ **Why this matters:** if `NODE_ENV` is not `production`, the enroll route returns a
> success URL without payment and `/api/payment/success` marks orders paid **without
> EPS verification** → free course access. And `NEXTAUTH_URL=localhost` breaks every
> payment/auth redirect.

Lock the file down: `chmod 600 .env.local`.

---

## 2. CRITICAL — server prerequisites

```bash
# Node 20 LTS (matches @types/node 20; Next 16 needs Node 18.18+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx

# Add swap — protects against OOM during build/runtime on small RAM
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

sudo npm i -g pm2
```

---

## 3. CRITICAL — database (use Atlas on KVM 1)

- Create a free **MongoDB Atlas M0** cluster.
- **Network Access → Add IP** → add the VPS public IP (or `0.0.0.0/0` only if you must).
- Put the SRV connection string in `MONGODB_URI`.
- The app caps the pool at `maxPoolSize: 10` and fails fast (`serverSelectionTimeoutMS: 10s`),
  and now resets a failed connection so a transient outage no longer wedges the app
  permanently (`lib/db.ts`).

*If you insist on local mongod (KVM 2 only):* `sudo apt-get install -y mongodb-org`,
bind to `127.0.0.1`, enable auth, and set `MONGODB_URI=mongodb://user:pass@127.0.0.1:27017/devcourses`.

---

## 4. Build & run

```bash
cd /var/www/devcourses
npm ci                 # reproducible install from package-lock.json
npm run build          # standalone output → .next/standalone
```

`next.config.ts` uses `output: 'standalone'`. Two ways to run:

**Option A — standalone (lighter):**
```bash
# standalone needs static assets + public copied next to the server
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
pm2 start .next/standalone/server.js --name devcourses --update-env
```

**Option B — classic:**
```bash
pm2 start "npm run start" --name devcourses --update-env
```

Then:
```bash
pm2 save
pm2 startup        # run the printed command so PM2 restarts on reboot
```

> The app listens on `:3000`. PM2 auto-restarts it on crash/OOM — covering unhandled
> rejections and memory spikes.

> ⚠️ Build is the most memory-hungry step on KVM 1. If `npm run build` gets OOM-killed,
> ensure swap (step 2) is active, or build on a bigger machine/CI and ship `.next`.

---

## 5. CRITICAL — file uploads persistence

Uploads (avatars, course thumbnails) are written to `public/uploads/` on local disk.

- This **persists** on a VPS (unlike Vercel) — good.
- But the folder is **gitignored**, so a fresh `git clone` redeploy into a new directory
  **loses old uploads**. Keep uploads on a **stable path** and symlink, or deploy in place.

Recommended: store uploads outside the repo and symlink, then let Nginx serve them:

```bash
sudo mkdir -p /var/data/uploads
sudo chown -R $USER:$USER /var/data/uploads
ln -s /var/data/uploads /var/www/devcourses/public/uploads
```

Ensure the Node process user has **write** permission to that path, or uploads 500.
Watch disk usage over time (`df -h`) — there is no automatic cleanup.

---

## 6. Nginx reverse proxy

`/etc/nginx/sites-available/devcourses`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 6M;   # uploads are capped at 5MB in the app

    # Serve uploaded files directly (faster, and works with standalone)
    location /uploads/ {
        alias /var/data/uploads/;
        access_log off;
        expires 30d;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;  # app reads this for IP + Meta CAPI
        proxy_set_header X-Forwarded-Proto $scheme;                   # needed for correct https URLs / auth
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/devcourses /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. CRITICAL — TLS (HTTPS)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

`NEXTAUTH_URL` and `EPS_*_URL` must be **https** — payment gateways reject http callbacks.

---

## 8. CRITICAL — third-party IP whitelisting

The VPS gets a new outbound IP. Two integrations enforce IP allow-lists:

- **BulkSMSBD** — whitelist the VPS IP in the panel, else OTP sends fail with code `1032`
  → **nobody can log in.**
- **EPS** — if they whitelist merchant server IPs, add the VPS IP, else payment init fails.

Find your outbound IP from the server: `curl -s ifconfig.me`.

---

## 9. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
# Do NOT expose :3000 or :27017 publicly — only Nginx (80/443) and SSH.
```

---

## 10. Post-deploy smoke test

- [ ] `https://yourdomain.com` loads (home page, DB-backed course list renders).
- [ ] OTP login: request OTP → SMS arrives → sign in works (`/dashboard` reachable).
- [ ] Admin: an `admin`-role user reaches `/admin`; a student is redirected.
- [ ] Enroll → EPS hosted page → pay (sandbox first) → redirected to `/payment/success`
      and the course appears in **My Courses**. Confirm the order is `success` in DB and
      that an **unpaid** attempt does NOT unlock the course (verification working).
- [ ] Avatar upload saves and the image loads from `/uploads/...`.
- [ ] `pm2 logs devcourses` clean; `pm2 restart devcourses` recovers; reboot survives.

---

## 11. Redeploy (subsequent updates)

```bash
cd /var/www/devcourses
git pull
npm ci
npm run build
# if standalone: re-copy static + public into .next/standalone (step 4A)
pm2 restart devcourses --update-env
```

---

## Quick reference — what each audit fix did in code

| Fix | File | Effect |
|-----|------|--------|
| `trustHost: true` | `lib/auth.config.ts` | Stops `UntrustedHost` crash behind Nginx |
| Connection reset + timeout + pool cap | `lib/db.ts` | Transient DB failure no longer wedges the app; bounded connections |
| `output: 'standalone'` | `next.config.ts` | Smaller, faster production runtime |
| Error boundaries | `app/global-error.tsx`, `app/(public)/error.tsx` | Graceful 500 instead of blank crash |
| Env guidance | `.env.example` | Prevents `NODE_ENV=development` / localhost in prod |
