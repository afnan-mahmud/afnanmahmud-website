# course.afnanmahmud.com — Dedicated Course Landing + Purchase Funnel

**Date:** 2026-07-19
**Status:** Approved, ready for implementation planning

## Summary

Launch a dedicated course website on the `course.afnanmahmud.com` subdomain whose
**only** job is a segment-gated marketing landing page plus the course purchase funnel.
Everything after purchase — login, dashboard, video learning — stays on the existing
`afnanmahmud.com` app. Both apps run from the **same git repo** and talk to the
**same MongoDB database**, so a purchase made on the subdomain is immediately usable
when the buyer logs in on the main domain.

The subdomain has **no auth, no dashboard, no admin, no video** — just: pick a
category → see a tailored landing page → enroll (name + phone) → EPS payment →
success page → "Continue Learning" button that sends the buyer to
`https://afnanmahmud.com/auth/otp`.

## Goals

- A brand-new, light-theme landing page (inspired by nextlevel.bd/courses/vibe-coding-bangla
  but visibly original — not a copy), for a single flagship course.
- A mandatory 5-way category gate before the landing page is shown.
- Full self-contained purchase funnel that reuses the existing EPS + Meta/TikTok
  tracking + Mongoose models, with **zero schema drift**.
- Cross-domain handoff to main-domain OTP login after purchase.
- **Zero changes to the live main app** (no risk to the running production site).

## Non-Goals

- No login / OTP / session on the subdomain.
- No dashboard, admin, curriculum, or video playback on the subdomain.
- No `?phone=` prefill of the main-domain OTP page in v1 (would require touching the
  main app). Plain link only; prefill is a possible later enhancement.
- No multi-course catalog — a single flagship course only.

## Architecture

### Repo topology (monorepo, non-invasive)

- Single git repo. The **main app at the repo root stays untouched.**
- New app lives in `course-landing/` with its own `package.json`,
  `next.config.ts`, `tsconfig.json`, `postcss.config`, and `app/globals.css`.
- `course-landing/tsconfig.json` maps `@/*` → repo root (`../*`), so the new app
  **imports the existing shared modules directly** — one source of truth, no
  duplication, no schema drift:
  - `models/*` (User, Course, Order, …)
  - `lib/db.ts` (`connectDB`)
  - `lib/eps.ts` (`initiatePayment`, `verifyPayment`, `newMerchantTransactionId`,
    `epsConfigured`)
  - `lib/order-fulfillment.ts` (`finalizeSuccessfulOrder`)
  - `lib/meta-capi.ts`, `lib/tiktok-events.ts`, `lib/meta-pixel.ts`
- **Critical config:** `course-landing/next.config.ts` must set
  `outputFileTracingRoot` to the repo root and `output: 'standalone'`. Without the
  tracing root, the standalone build will not trace files that live outside
  `course-landing/` (`../models`, `../lib`) and production will crash with
  "module not found".
- It also reuses segment **content** data: `app/ai-for-developers/segments/*.ts`
  (`beginner`, `developer`, `entrepreneur`, `freelancer`, `student`) and their
  `_landing/content.ts` types + `_landing/icons`. Content is reused; the visual
  section components are new.

### Runtime & deploy

- Separate **pm2 process** on a new port (e.g. `PORT=3001`), run from the standalone
  bundle: `node course-landing/.next/standalone/course-landing/server.js`
  (exact path confirmed at implementation time from the standalone output layout).
- **nginx:** new `server` block for `course.afnanmahmud.com` → `proxy_pass` to
  `127.0.0.1:3001`; TLS via certbot for the subdomain.
- **DNS:** `course` A/CNAME record pointing at the same VPS IP.
- **Env:** shares the existing `.env` / `.env.local` values (`MONGODB_URI`, `EPS_*`,
  `META_*`, `TIKTOK_*`). The subdomain process sets its own
  `NEXTAUTH_URL=https://course.afnanmahmud.com` so that the enroll route builds
  `successUrl`/`failUrl`/`cancelUrl` back to the **subdomain's own** payment routes,
  never the main domain.
- **Deploy order (per project memory):** build fully, *then* restart the pm2 process —
  never restart against a half-written `.next`.

## Feature detail

### 1. Category gate (5-way segment picker)

- First visit with no segment selected → a full-screen chooser with 5 cards:
  `beginner`, `developer`, `entrepreneur`, `freelancer`, `student` (labels/copy from
  the existing segment data `meta`/hero).
- The landing page content is **not accessible** until a category is chosen.
- On select: set `?seg=<key>` in the URL and persist to `localStorage`
  (key e.g. `courseSegment`). On return/refresh, the stored segment restores the
  landing directly. `?seg=` in the URL wins over storage (shareable links).
- A visible "change category" affordance re-opens the gate.
- Invalid/unknown `seg` values fall back to the gate.

### 2. Landing page (brand-new, light theme)

- Original light-theme design; distinct layout/spacing/components so it does not read
  as a copy of the inspiration site.
- Bangla-friendly typography; sticky enroll CTA; trust / social proof.
- Sections rendered from the selected segment's content, ordered per that segment's
  `sectionOrder`. New section components live in
  `course-landing/app/_landing/sections/` (or similar) — new visuals, same data shape
  (`SegmentContent`).
- **Pricing / value-anchoring section** modeled on `demo-landing.html`
  (line ~276, `<!-- Pricing / Value Anchoring -->`): stacked value list with
  strike-through per-item prices → total market value (struck) → today's offer price →
  urgency line → full-width CTA.

### 3. Enroll modal + funnel

- `EnrollModal` collects **name + phone** (BD format `01XXXXXXXXX`), same validation
  as the existing landing modal.
- `POST /api/enroll/landing` (a thin copy in the subdomain app importing shared lib):
  find/create `User`, guard already-purchased, create a `pending` `Order` with a
  unique `merchantTransactionId`, fire Meta + TikTok `InitiateCheckout`, then either
  return the EPS `RedirectURL` or (dev, `epsConfigured()` false) the direct success URL.
- Flagship course slug is fixed in the subdomain enroll route (single-course funnel).

### 4. Payment routes (subdomain copies, shared lib)

Subdomain needs the payment route family its success route depends on:

- `GET /api/payment/success` — verify via `verifyPayment`, amount-match anti-tampering,
  `finalizeSuccessfulOrder` (idempotent: adds course to `purchasedCourses`, increments
  `enrolledCount`, marks order `success`, fires Purchase events), then redirect to the
  subdomain success page. `outcome === 'pending'` → subdomain `/payment/processing`;
  `failed` → subdomain `/payment/failed`.
- `GET /api/payment/fail` — mark failed, redirect to `/payment/failed`.
- Pages: `/payment/success`, `/payment/failed`, `/payment/processing`.
- **Reconciliation:** the main app's existing reconcile cron already scans the shared
  `Order` collection and calls the shared, DB-only `finalizeSuccessfulOrder`, so
  pending subdomain orders get settled automatically — no separate cron needed on the
  subdomain.

### 5. Cross-domain handoff (the core requirement)

- After a successful charge the buyer lands on the **subdomain** `/payment/success`
  page showing purchase confirmation.
- Primary CTA: **"Continue Learning →"** → `https://afnanmahmud.com/auth/otp`.
- Because both apps share the DB, the buyer's `User` already exists with the course in
  `purchasedCourses`; logging in via phone OTP on the main domain unlocks it
  immediately. No cross-domain cookie/session sharing is needed or attempted.

## Reuse vs. new

| Reused (shared root code, unchanged) | New (in `course-landing/`) |
|---|---|
| `models/*`, `lib/db`, `lib/eps`, `lib/order-fulfillment`, `lib/meta-capi`, `lib/tiktok-events`, `lib/meta-pixel` | `app/layout.tsx`, `app/page.tsx` (gate + landing), `app/_landing/sections/*` (light theme) |
| `app/ai-for-developers/segments/*.ts` + `_landing/content` types + `_landing/icons` | `PricingAnchor` section, `EnrollModal` |
| EPS / Meta / TikTok env values | `api/enroll/landing`, `api/payment/success`, `api/payment/fail` (thin copies) |
| Main app's reconcile cron (settles pending orders in shared DB) | `payment/success`, `payment/failed`, `payment/processing` pages; `globals.css` (light theme); pm2 + nginx config |

## Risks & gotchas

- **`outputFileTracingRoot`** must point at the repo root or the standalone build
  omits `../models` / `../lib`. Highest-risk item; verify the standalone bundle boots
  before switching nginx traffic.
- **Mongoose model registration** is per-process, so both apps registering the same
  models from the same source files is fine — no `OverwriteModelError` across
  processes.
- **`@/*` alias must resolve at build for the shared lib's own internal `@/` imports** —
  the subdomain `tsconfig` `@/*` → `../*` covers this since both share the repo root.
- **`NEXTAUTH_URL`** on the subdomain process is used purely as the base URL for
  building payment redirect URLs (no NextAuth runs here); it must be the subdomain URL.
- **Tailwind v4** — the subdomain app needs its own `globals.css` / postcss setup
  (light theme), independent of the main app's dark theme.
- **Stale `.next` on deploy** — build fully, then pm2 restart.

## Testing

No test framework is configured. Verification is manual:

1. Local: run the subdomain app; with `epsConfigured()` false (dev bypass) walk the
   full funnel — gate → segment landing → enroll → dev-success — and confirm an `Order`
   is created and the course is added to `purchasedCourses`.
2. Confirm the "Continue Learning" link goes to the main domain OTP page and that,
   after OTP login there, the flagship course is unlocked in the dashboard.
3. Pre-cutover on the server: boot the standalone bundle on :3001 and hit it directly
   (bypassing nginx) to confirm shared-module tracing succeeded before switching DNS/nginx.
