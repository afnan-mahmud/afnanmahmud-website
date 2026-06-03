# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Next.js 16 — read the bundled docs first.** This repo runs Next.js 16.2.2 with React 19 and Tailwind v4. APIs and conventions differ from older Next.js in your training data (e.g. `params`/`searchParams` are Promises and must be awaited in server components/route handlers). Before writing framework code, consult `node_modules/next/dist/docs/`.

## Commands

```bash
npm run dev      # dev server on :3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (flat config, eslint-config-next)
```

There is **no test framework** configured. Standalone scripts (e.g. `scripts/seed-ai-for-developers.ts`) read env explicitly and are run with Node's `--env-file` flag, not via a bundler:

```bash
node --env-file=.env.local --env-file=.env scripts/seed-ai-for-developers.ts
```

Env is split across `.env.local` (real secrets, gitignored) and `.env`; `.env.example` lists the keys. Required/used vars: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `BULKSMS_API_KEY`/`BULKSMS_SENDER_ID`, `EPS_BASE_URL`/`EPS_USERNAME`/`EPS_PASSWORD`/`EPS_HASH_KEY`/`EPS_MERCHANT_ID`/`EPS_STORE_ID` (+ optional `EPS_TRANSACTION_TYPE_ID`, `EPS_CANCEL_URL`), `NEXT_PUBLIC_META_PIXEL_ID`/`META_CAPI_ACCESS_TOKEN`/`META_TEST_EVENT_CODE`, `RESEND_API_KEY`, `CLOUDINARY_*` (unused — see Uploads).

**Dev server gotcha:** the Next 16 dev server intermittently serves stale compiled output — an edit on disk doesn't reflect in the browser even though the file is correct. When that happens, don't re-edit: `pkill -f "next dev"; rm -rf .next/dev .next/cache; npm run dev`.

## Architecture

Next.js App Router. Path alias `@/*` maps to the repo root. UI copy is bilingual Bangla/English; phone numbers use BD format `01XXXXXXXXX`.

### Routing layout (`app/`)
Route groups separate concerns and apply their own layouts:
- `(public)/` — marketing + course pages, `/courses/[slug]`, `/payment/success|failed`, etc.
- `(auth)/auth/otp` — phone+OTP sign-in page.
- `(dashboard)/dashboard` and `(admin)/admin` — authenticated areas.
- `ai-for-developers/` — a standalone, self-contained landing page (its own client component, inline `globalStyles`, `EnrollModal`) for the flagship course; not part of `(public)`.
- `api/` — route handlers (auth, courses, enroll, payment, progress, upload, track, admin, user).

### Auth (NextAuth v5 beta, JWT)
Passwordless phone OTP. Flow: `POST /api/auth/send-otp` generates a code, stores an `OtpCode`, and sends SMS via `lib/sms.ts`; the OTP page calls `signIn('credentials', { phone, otp })`, whose `authorize` (in `lib/auth.ts`) runs `verifyOtpCode`. Sessions are JWT; `lib/auth.config.ts` augments the token/session with `id` and `role` (`student` | `admin`) and declares the module types. `middleware.ts` gates `/dashboard/*` (logged in) and `/admin/*` (role `admin`), redirecting to `/auth/otp` or `/dashboard`. Note the standalone `/api/auth/verify-otp` route exists but is **not** the live login path — verification goes through the NextAuth credentials provider.

### Data (MongoDB + Mongoose)
`lib/db.ts` exposes `connectDB()`, a global-cached connection singleton — **call it before any model query** in a request. Models in `models/`:
- `User` — `phone` (unique), `role`, `purchasedCourses[]`, embedded `progress`, `avatar`.
- `Course` — `slug` (unique), `price`, `isPublished`/`isFree`, `enrolledCount`, `level` enum, and an **embedded** `curriculum` of sections → lessons (lessons carry `videoId`, `isPreview`).
- `Order` — references `student`/`course`, `amount`, `status` (`pending`|`success`|`failed`), `paymentGateway`, `transactionId`.
- `OtpCode` — short-lived codes for sign-in.

### Payments (EPS gateway, `lib/eps.ts`)
Implements the EPS (Easy Payment System) V5 merchant API: `GetToken` (bearer auth, cached) → `InitializeEPS` (returns the hosted-page `RedirectURL`) → `CheckMerchantTransactionStatus` (server-side verify). Every request carries an `x-hash` header = `base64(HMAC-SHA512(key=utf8(EPS_HASH_KEY), msg=data))`, where `data` is the `userName` (GetToken) or the `merchantTransactionId` (initialize/verify). Endpoints are `EPS_BASE_URL` + `/v1/Auth/GetToken` | `/v1/EPSEngine/InitializeEPS` | `/v1/EPSEngine/CheckMerchantTransactionStatus`.

Purchase funnel: the landing `EnrollModal` (name + phone) → `POST /api/enroll/landing`, which finds/creates the `User`, generates a unique `merchantTransactionId` (`newMerchantTransactionId()`), creates a `pending` `Order` storing it, and calls `initiatePayment` to get the redirect URL. EPS redirects back to `GET /api/payment/success?orderId=...`, which calls `verifyPayment(order.merchantTransactionId)`, checks the returned `Status === 'Success'` **and** that the verified amount matches the order (anti-tampering), then marks the order `success` (saving the EPS `transactionId`), adds the course to `purchasedCourses`, increments `enrolledCount`, and redirects to `/payment/success`. **Dev bypass:** when `epsConfigured()` is false and `NODE_ENV !== 'production'`, the enroll route returns the success URL directly and the success route accepts without calling EPS.

### File uploads (`/api/upload`)
Saves files to the **local filesystem** under `public/uploads/<folder>/` (gitignored) and returns a `/uploads/...` URL — it does **not** use Cloudinary (`lib/cloudinary.ts` is dead code). The `folder` form field is whitelisted to `avatars` | `thumbnails`; only `avatars` uploads update `User.avatar`. This will not persist on serverless hosts (e.g. Vercel) — swap to object storage there.

### Meta Pixel + Conversions API
Two layers that deduplicate via a shared `event_id`: client pixel (`lib/meta-pixel.ts` + `components/tracking/MetaPixel.tsx`, mounted in the root layout) and server CAPI (`lib/meta-capi.ts`). Full funnel: PageView, ViewContent, InitiateCheckout (enroll), Purchase (payment success), CompleteRegistration (OTP verify, via the auth-gated `/api/track/complete-registration`). Both layers are **no-ops when env is unset**, so they never break existing flows.

### SMS (`lib/sms.ts`, BulkSMSBD)
Sends OTPs. The API expects **form-encoded** params (not JSON), a `type=text` field, and numbers prefixed with `88` (`8801XXXXXXXXX`). The account also enforces **IP whitelisting** — the server's outbound IP must be whitelisted in the BulkSMSBD panel or sends return code `1032`.
