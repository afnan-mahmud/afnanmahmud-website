# Deployment

Auto-deploy: push to `main` → GitHub Actions lints & type-checks → SSHes into the
VPS → `git pull && npm ci && npm run build && pm2 reload`. Zero downtime via PM2.

```
push main ──► GitHub Actions
                 │  check  (npm ci, lint, tsc --noEmit)
                 └─ deploy (ssh → scripts/deploy.sh on the VPS)
                                   │ git pull --ff-only
                                   │ npm ci && npm run build
                                   └ pm2 startOrReload ecosystem.config.js
```

The repo is **public**, so no application secrets live in it. Real secrets stay in
`.env.local` **on the server only**. GitHub only holds the SSH credentials needed
to reach the box.

---

## 1. Prerequisites

- A VPS you can SSH into (Ubuntu 22.04+ assumed; e.g. DigitalOcean, Hetzner, Contabo).
- A MongoDB connection string (Atlas or self-hosted).
- A domain pointed (A record) at the VPS IP, if you want HTTPS.

## 2. One-time server setup

SSH into the VPS and run:

```bash
# Node 20 + build tools
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2

# Clone the repo (use the path you'll set as DEPLOY_PATH)
sudo mkdir -p /var/www && sudo chown "$USER" /var/www
cd /var/www
git clone https://github.com/<your-username>/<your-repo>.git afnan-web
cd afnan-web
```

Create `.env.local` with the real values (this file is gitignored and never leaves
the server):

```bash
nano .env.local
```

```dotenv
NODE_ENV=production
MONGODB_URI=...
NEXTAUTH_SECRET=...            # openssl rand -base64 32
NEXTAUTH_URL=https://yourdomain.com

BULKSMS_API_KEY=...
BULKSMS_SENDER_ID=...

EPS_MERCHANT_ID=...
EPS_API_KEY=...
EPS_BASE_URL=...
EPS_SUCCESS_URL=https://yourdomain.com/api/payment/success
EPS_FAIL_URL=https://yourdomain.com/api/payment/fail
EPS_CANCEL_URL=https://yourdomain.com

NEXT_PUBLIC_META_PIXEL_ID=...
META_CAPI_ACCESS_TOKEN=...
META_TEST_EVENT_CODE=

RESEND_API_KEY=...
```

> `NEXT_PUBLIC_*` vars are baked in at **build time**, so they must exist before
> `npm run build`. Changing the pixel id requires a redeploy.

First build and start under PM2:

```bash
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save                  # persist the process list
pm2 startup               # print a command — run it (with sudo) so PM2 survives reboots
```

The app now listens on `127.0.0.1:3000`.

## 3. Nginx reverse proxy + HTTPS

```bash
sudo nano /etc/nginx/sites-available/afnan-web
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    client_max_body_size 6M;   # uploads cap is 5MB; leave headroom

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/afnan-web /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# HTTPS
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

> `X-Forwarded-For` matters: the Meta CAPI code reads the client IP from this
> header for match quality. Without the proxy header it falls back to the proxy IP.

## 4. Deploy SSH key

Generate a dedicated key for CI (no passphrase) and authorize it on the VPS:

```bash
# On your laptop:
ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-actions"
# Copy the PUBLIC key onto the server's authorized_keys:
ssh-copy-id -i deploy_key.pub <user>@<vps-ip>
# (or append deploy_key.pub to ~/.ssh/authorized_keys on the server)
```

## 5. GitHub secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `SSH_HOST` | VPS IP or hostname |
| `SSH_USER` | the SSH user (e.g. `ubuntu`) |
| `SSH_PRIVATE_KEY` | full contents of `deploy_key` (the private key) |
| `SSH_PORT` | SSH port — **optional**, defaults to `22` |
| `DEPLOY_PATH` | absolute path to the repo on the server, e.g. `/var/www/afnan-web` |

That's it — push to `main` and the workflow deploys.

## 6. Manual deploy / rollback

```bash
# Manual deploy (same script CI runs)
cd /var/www/afnan-web && bash scripts/deploy.sh

# Rollback to a previous commit
git reset --hard <good-commit-sha>
npm ci && npm run build && pm2 reload ecosystem.config.js
```

## 7. Operating notes

- **Logs:** `pm2 logs afnan-web` · **status:** `pm2 status` · **restart:** `pm2 restart afnan-web`
- **Uploads** are written to `public/uploads/` on the server's disk. They are NOT in
  git and NOT copied between machines — back up this directory (or move to object
  storage) if you ever migrate servers.
- **First deploy via CI** works too: `pm2 startOrReload` starts the app if it isn't
  running yet, as long as step 2's `npm ci` has populated `node_modules` at least once.
- A failed `npm run build` on the server leaves the old PM2 process running, so a
  broken build won't take the site down — but the `check` gate should catch it first.
