# course.afnanmahmud.com — Course Landing + Purchase Funnel

A second Next.js app that serves the dedicated, segment-gated course landing page
and purchase funnel on the `course.afnanmahmud.com` subdomain. It runs from **this
same repo** and shares the **same MongoDB database** as the main `afnanmahmud.com`
app, so a purchase made here is immediately usable when the buyer logs in on the
main domain.

- **No auth / dashboard / video here.** After purchase, the success page's
  "Continue Learning" button sends the buyer to `https://afnanmahmud.com/auth/otp`,
  where they log in with the same phone number and the course is already unlocked.
- **Shared code, zero drift.** All `@/models/*` and `@/lib/*` imports resolve to the
  repo root via the `@/* → ../*` alias in `tsconfig.json`. There is only one copy of
  the schemas and the EPS/tracking logic.

## Important: no separate install

This app has **no `node_modules` of its own** and must not be `npm install`-ed here.
It shares the repo-root install:

- `npm run` scripts add ancestor `node_modules/.bin` to `PATH`, so `next` is found.
- Every `@/*` import resolves to a repo-root file, which resolves its own deps
  (`mongoose`, `next`, `react`) against the **root** `node_modules` — guaranteeing a
  single `mongoose` instance and single React across both apps.

Always run a root `npm install` first, then build/run from this folder.

## Local development

```bash
# from repo root, once:
npm install

# then, from this folder:
cd course-landing
npm run dev            # http://localhost:3001
```

With EPS credentials unset and `NODE_ENV !== production`, the enroll route
dev-bypasses the gateway and returns the success URL directly, so you can walk the
full funnel locally (this writes a User + Order to whatever `MONGODB_URI` points at —
use a dev database, not production).

## Environment

Shares the repo-root `.env` / `.env.local` (same `MONGODB_URI`, `EPS_*`,
`META_*`, `NEXT_PUBLIC_META_PIXEL_ID`, `TIKTOK_*`). The **one value that must differ
for this process**:

```
NEXTAUTH_URL=https://course.afnanmahmud.com
```

This app uses `NEXTAUTH_URL` only as the base URL for building EPS
success/fail/cancel redirect targets — pointing it at the subdomain keeps the whole
payment round-trip on `course.afnanmahmud.com` and off the main domain. (No NextAuth
runs here.)

> **Runtime env in production:** the standalone server does **not** auto-load the
> repo-root `.env` files (its CWD is `course-landing/`). Make the shared vars
> (`MONGODB_URI`, `EPS_*`, `META_*`, `NEXT_PUBLIC_META_PIXEL_ID`, `TIKTOK_*`, plus the
> subdomain `NEXTAUTH_URL`) present in the process environment by ONE of:
> - listing them in the pm2 `ecosystem.config.js` `env` block, or
> - copying/symlinking the root `.env` / `.env.local` into `course-landing/` before
>   `pm2 start`, or
> - launching with `node --env-file=../.env.local --env-file=../.env .next/standalone/course-landing/server.js`.
>
> Note `NEXT_PUBLIC_*` values are inlined at **build** time, so a fresh `npm run build`
> is required if the pixel id changes.

## Production build & run (VPS)

Standalone output. **Build fully first, then restart the process** — never restart
against a half-written `.next` (see the repo's deploy notes).

```bash
# from repo root
npm install
cd course-landing
npm run build

# REQUIRED: the standalone output does NOT include static assets or /public.
# Copy them next to the standalone server or every JS/CSS chunk 404s and the
# page renders BLANK (the gate/landing never hydrate). This step is mandatory
# on every deploy.
cp -r .next/static .next/standalone/course-landing/.next/static
[ -d public ] && cp -r public .next/standalone/course-landing/public || true

# the standalone entrypoint (verified path):
#   .next/standalone/course-landing/server.js
# run it on port 3001, with NEXTAUTH_URL set for this subdomain:
NEXTAUTH_URL=https://course.afnanmahmud.com PORT=3001 \
  node .next/standalone/course-landing/server.js
```

Standalone bundles only what file-tracing reaches. `next.config.ts` sets
`outputFileTracingRoot` to the repo root so `../models`, `../lib`, and the shared
`node_modules` are included — but **static assets (`.next/static`) and `public/` are
never bundled and must be copied in manually (see the `cp` step above).** After
building and copying, boot the bundle and hit it directly
(`curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/_next/static/…`) to
confirm a chunk returns `200`, before switching nginx traffic.

### pm2

```bash
# start (from course-landing/)
NEXTAUTH_URL=https://course.afnanmahmud.com PORT=3001 \
  pm2 start .next/standalone/course-landing/server.js --name course-landing

# on redeploy: build FULLY, copy static assets in (the required cp step above),
# THEN restart
pm2 restart course-landing
pm2 save
```

Or use the provided `ecosystem.config.js`:

```bash
cd course-landing
pm2 start ecosystem.config.js
```

### nginx

Add a server block for the subdomain and issue a certificate for it
(`certbot --nginx -d course.afnanmahmud.com`):

```nginx
server {
    server_name course.afnanmahmud.com;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # (certbot fills in listen 443 / ssl_certificate lines)
}
```

`X-Forwarded-For` matters: the enroll route forwards the client IP to EPS and the
tracking layers.

### DNS

Add a record for the subdomain pointing at the same VPS IP as `afnanmahmud.com`:

```
course   A      <VPS_IP>
# or, if afnanmahmud.com is a CNAME/behind a proxy:
course   CNAME  afnanmahmud.com.
```

## Payment reconciliation

Pending orders created here settle automatically: the **main app's** existing
reconcile cron scans the shared `Order` collection and calls the shared,
DB-only `finalizeSuccessfulOrder`. No separate cron is needed on this subdomain.
