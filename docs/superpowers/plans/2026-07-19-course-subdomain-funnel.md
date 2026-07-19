# course.afnanmahmud.com Subdomain Funnel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch a dedicated, light-theme, segment-gated course landing + purchase funnel on `course.afnanmahmud.com`, running from the same repo and DB as the main app, that hands off to `afnanmahmud.com/auth/otp` after purchase.

**Architecture:** A second Next.js 16 app in a `course-landing/` subfolder of the existing repo. It reuses the main app's Mongoose models and `lib/*` (EPS, db, order-fulfillment, meta/tiktok) directly via a `@/*` → repo-root tsconfig alias — zero schema drift, main app untouched. Runs as its own pm2 process on port 3001 behind an nginx server block; `NEXTAUTH_URL` set to the subdomain URL so EPS redirects come back to the subdomain's own payment routes.

**Tech Stack:** Next.js 16.2.2 (App Router, standalone output), React 19, Tailwind v4, Mongoose 9, EPS gateway, Meta CAPI + TikTok Events.

## Global Constraints

- Next.js 16 conventions: `params`/`searchParams` are Promises — await them. Consult `node_modules/next/dist/docs/` before framework code.
- No test framework exists. Verification = `npx tsc --noEmit` (or `next build`) + manual dev-server walkthrough.
- Do **not** modify any file at the repo root that the main app owns (`app/`, root `next.config.ts`, root `package.json`, `lib/`, `models/`). Shared `lib/`/`models` are read-only reuse.
- Light theme only for the subdomain. Design inspired by nextlevel.bd/courses/vibe-coding-bangla but original — not a copy.
- Bilingual Bangla/English copy; BD phone format `01XXXXXXXXX`.
- Flagship course slug: `complete-website-and-mobile-application-development-course-by-ai` (the `enroll/landing` `DEFAULT_COURSE_SLUG`). Confirm it is in `ALLOWED_SLUGS` before wiring.
- 5 segments: `beginner`, `developer`, `entrepreneur`, `freelancer`, `student`.
- Success CTA target: `https://afnanmahmud.com/auth/otp`.
- Frequent commits, one deliverable per task.

---

### Task 1: Scaffold the `course-landing/` app + shared-code wiring

**Files:**
- Create: `course-landing/package.json`
- Create: `course-landing/next.config.ts`
- Create: `course-landing/tsconfig.json`
- Create: `course-landing/next-env.d.ts`
- Create: `course-landing/postcss.config.mjs`
- Create: `course-landing/app/globals.css`
- Create: `course-landing/app/layout.tsx`
- Create: `course-landing/app/page.tsx` (temporary "hello" placeholder, replaced in Task 3)
- Create: `course-landing/.gitignore`

**Interfaces:**
- Produces: a buildable second Next app whose `@/*` resolves to the repo root, so `@/lib/*` and `@/models/*` import the shared code.

- [ ] **Step 1: `course-landing/package.json`** — own dependencies mirroring the versions the shared code needs (next 16.2.2, react 19.2.4, mongoose 9.4.1, axios, tailwind v4, lucide-react 1.7.0, framer-motion optional). Scripts: `dev` (`next dev -p 3001`), `build`, `start` (`next start -p 3001`), `lint`.

- [ ] **Step 2: `course-landing/tsconfig.json`** — `compilerOptions.paths` = `{ "@/*": ["../*"] }`, `baseUrl: "."`, plugin `next`, `moduleResolution: "bundler"`, include `../models`, `../lib`, and local `app`. Mirror the root tsconfig's strictness.

- [ ] **Step 3: `course-landing/next.config.ts`** — `output: 'standalone'` and `outputFileTracingRoot: path.join(__dirname, '..')` (repo root) so the standalone build traces `../models` and `../lib`. Carry over the immutable static-asset cache header block from the root config.

- [ ] **Step 4: postcss + globals.css** — Tailwind v4 `@import "tailwindcss";` with a **light** base (`:root` light tokens, `body { background:#f7f8fb; color:#0f172a }`), Bangla font stack (Hind Siliguri / Anek Bangla via next/font or a self-hosted/`@font-face`), and CSS custom props for a segment accent (`--seg-accent`, `--seg-accent-2`) consumed by sections.

- [ ] **Step 5: `app/layout.tsx`** — light `<html data-theme="light">`, metadata (title "Afnan Mahmud — Courses"), fonts, and mount the shared client `MetaPixel` component (`@/components/tracking/MetaPixel`) for PageView. No NextAuth, no dashboard chrome.

- [ ] **Step 6: placeholder `app/page.tsx`** returning a simple `<main>Course landing</main>` so the app builds.

- [ ] **Step 7: Verify build traces shared code**
Run: `cd course-landing && npm install && npx tsc --noEmit`
Expected: no "cannot find module '@/lib/...'" errors.
Then: `npm run build` — expect a successful standalone build.

- [ ] **Step 8: Commit**
```bash
git add course-landing
git commit -m "feat(course-subdomain): scaffold course-landing app reusing shared models/lib"
```

---

### Task 2: Category gate (5-way segment picker)

**Files:**
- Create: `course-landing/app/_gate/CategoryGate.tsx` (client)
- Create: `course-landing/app/_gate/segments.ts` (label/blurb/accent per segment key, sourced from `@/app/ai-for-developers/segments/*` `meta` + `theme`)
- Create: `course-landing/app/_gate/useSegment.ts` (hook: read `?seg=` → else `localStorage.courseSegment` → else null; setter persists both)

**Interfaces:**
- Consumes: `SegmentKey` from `@/app/ai-for-developers/_landing/theme`.
- Produces: `useSegment(): { segment: SegmentKey | null, choose(k): void, reset(): void }`; `<CategoryGate onChoose={choose} />` full-screen chooser.

- [ ] **Step 1: `segments.ts`** — export `GATE_SEGMENTS: { key: SegmentKey; label: string; blurb: string }[]` for all 5, copy pulled/adapted from each segment's `hero`/`meta`.

- [ ] **Step 2: `useSegment.ts`** — client hook. On mount: prefer `new URLSearchParams(location.search).get('seg')` if it's a valid `SegmentKey`, else `localStorage.getItem('courseSegment')`. `choose(k)` writes `localStorage` and `history.replaceState` with `?seg=k`. `reset()` clears both.

- [ ] **Step 3: `CategoryGate.tsx`** — light full-screen overlay, heading "আপনি কোন ক্যাটাগরিতে পড়েন?", 5 selectable cards (accent-tinted), each calling `onChoose(key)`. Keyboard-accessible.

- [ ] **Step 4: Verify** — temporarily render the gate in `page.tsx`, `npm run dev`, confirm selection sets `?seg=` and persists across refresh.
Run: `cd course-landing && npm run dev` then load `http://localhost:3001`.

- [ ] **Step 5: Commit**
```bash
git add course-landing/app/_gate
git commit -m "feat(course-subdomain): 5-way category gate with URL+localStorage persistence"
```

---

### Task 3: Light-theme landing shell + segment orchestration

**Files:**
- Create: `course-landing/app/_landing/LightSegmentLanding.tsx` (client orchestrator, light analog of `SegmentLanding.tsx`)
- Create: `course-landing/app/_landing/ui.tsx` (light `Reveal`, `GradientText`, `Accordion`, `SectionHeading`, `Container`)
- Create: `course-landing/app/EnrollContext.tsx` (local copy — modal open/close state; the main app's is coupled to its own modal)
- Modify: `course-landing/app/page.tsx` — gate-then-landing composition
- Create: `course-landing/app/_landing/segments.ts` (registry: `Record<SegmentKey, SegmentContent>` importing the 5 `@/app/ai-for-developers/segments/*`)

**Interfaces:**
- Consumes: `SegmentContent`, `SectionKey` from `@/app/ai-for-developers/_landing/content`; the 5 segment data objects.
- Produces: `<LightSegmentLanding content={SegmentContent} />`; `useEnroll()` context.

- [ ] **Step 1: `_landing/segments.ts`** — `export const SEGMENTS: Record<SegmentKey, SegmentContent> = { beginner, developer, entrepreneur, freelancer, student }` importing from `@/app/ai-for-developers/segments/*`.

- [ ] **Step 2: `ui.tsx`** — port `Reveal` from the main `LandingClient` (framework-agnostic, keep as-is) and add **light** `GradientText` (accent gradient on light bg), `Container`, `SectionHeading`, `Accordion`.

- [ ] **Step 3: `EnrollContext.tsx`** — minimal provider: `{ open: boolean, openEnroll(): void, closeEnroll(): void }`.

- [ ] **Step 4: `LightSegmentLanding.tsx`** — light wrapper with `themeStyle(content.key)` for accent vars, a light `Navbar`, renders `<Hero>` + `content.sectionOrder.map(renderSection)` + `<PricingAnchor>` + `<Footer>`, wrapped in `EnrollProvider`. `renderSection` switch mirrors the main orchestrator but points at the new light sections (Task 4). Mount `@/components/tracking/ViewContentTracker` with the flagship slug/price.

- [ ] **Step 5: `page.tsx`** — `'use client'`; `const { segment, choose, reset } = useSegment()`; if `!segment` render `<CategoryGate onChoose={choose} />`, else `<LightSegmentLanding content={SEGMENTS[segment]} />` with a "change category" button calling `reset`.

- [ ] **Step 6: Verify** — `npm run dev`; pick a segment, confirm the landing shell renders with that segment's hero and no crash for each of the 5 segments.

- [ ] **Step 7: Commit**
```bash
git add course-landing/app/_landing course-landing/app/EnrollContext.tsx course-landing/app/page.tsx
git commit -m "feat(course-subdomain): light-theme segment landing shell + orchestration"
```

---

### Task 4: Light-theme landing sections

**Files:**
- Create: `course-landing/app/_landing/sections/Hero.tsx`
- Create: `course-landing/app/_landing/sections/SocialProof.tsx`
- Create: `course-landing/app/_landing/sections/PainPoints.tsx`
- Create: `course-landing/app/_landing/sections/Outcomes.tsx`
- Create: `course-landing/app/_landing/sections/WhyBest.tsx`
- Create: `course-landing/app/_landing/sections/DevStack.tsx`
- Create: `course-landing/app/_landing/sections/Curriculum.tsx`
- Create: `course-landing/app/_landing/sections/Audience.tsx`
- Create: `course-landing/app/_landing/sections/Instructor.tsx`
- Create: `course-landing/app/_landing/sections/Feedback.tsx`
- Create: `course-landing/app/_landing/sections/Faq.tsx`
- Create: `course-landing/app/_landing/sections/CtaBanner.tsx`
- Create: `course-landing/app/_landing/sections/Footer.tsx`
- Create: `course-landing/app/_landing/sections/Navbar.tsx`

**Interfaces:**
- Consumes: the typed props from `SegmentContent` sub-objects (e.g. `PainPoints({ heading, items })`) — same prop shapes as the main app's sections so segment data flows unchanged.
- Common sections (`DevStack`, `Curriculum`, `Instructor`) take no props; port their copy from the main app's corresponding `app/ai-for-developers/_landing/sections/*.tsx`.

- [ ] **Step 1:** Build data-driven sections (`Hero`, `PainPoints`, `Outcomes`, `WhyBest`, `Audience`, `Feedback`, `Faq`) as light cards using segment props + accent CSS vars. Each uses `Reveal`/`SectionHeading` from `ui.tsx`.

- [ ] **Step 2:** Build common sections (`SocialProof`, `DevStack`, `Curriculum`, `Instructor`, `Footer`, `Navbar`, `CtaBanner`) porting copy from the main app's dark versions into light styling. `Navbar` and `CtaBanner`'s primary buttons call `openEnroll()`.

- [ ] **Step 3: Verify** — `npm run dev`, walk all 5 segments, confirm every section in each segment's `sectionOrder` renders in light theme with no missing-data crashes.

- [ ] **Step 4: Commit**
```bash
git add course-landing/app/_landing/sections
git commit -m "feat(course-subdomain): light-theme landing sections"
```

---

### Task 5: Pricing / value-anchoring section

**Files:**
- Create: `course-landing/app/_landing/sections/PricingAnchor.tsx`

**Interfaces:**
- Consumes: `useEnroll()` (primary CTA opens the modal).
- Produces: `<PricingAnchor />` used by `LightSegmentLanding`.

- [ ] **Step 1:** Build the section modeled on `demo-landing.html` line ~276: a value-stack list (each item title + strike-through market price), a struck total market value, the offer price (course price, e.g. `৳999`), an urgency line ("lifetime access, one-time payment"), and a full-width CTA that calls `openEnroll()`. Light card with accent border/shadow. Copy in Bangla/English.

- [ ] **Step 2: Verify** — `npm run dev`, confirm the section renders and its CTA opens the enroll modal.

- [ ] **Step 3: Commit**
```bash
git add course-landing/app/_landing/sections/PricingAnchor.tsx
git commit -m "feat(course-subdomain): value-anchoring pricing section"
```

---

### Task 6: Enroll modal + `/api/enroll/landing` route

**Files:**
- Create: `course-landing/app/_landing/EnrollModal.tsx` (client, mounted by `EnrollProvider`)
- Create: `course-landing/app/api/enroll/landing/route.ts` (thin copy of the root route, importing shared lib, flagship slug fixed)

**Interfaces:**
- Consumes: shared `@/lib/eps`, `@/lib/meta-capi`, `@/lib/tiktok-events`, `@/models/*`, `@/lib/db`.
- Produces: POST `/api/enroll/landing` returning `{ paymentUrl, eventId, value, currency, contentId, contentName }` or `{ alreadyPurchased }` or `{ error }`.

- [ ] **Step 1: route** — copy `app/api/enroll/landing/route.ts` into the subdomain app; hardcode `COURSE_SLUG` to the flagship slug (single-course funnel); keep the same normalisation, order creation, InitiateCheckout events. `successUrl`/`failUrl`/`cancelUrl` built from `process.env.NEXTAUTH_URL` — which for this process is the subdomain URL. `cancelUrl` = subdomain root (`/`).

- [ ] **Step 2: `EnrollModal.tsx`** — light modal with name + phone fields, BD-phone validation, fires the client Meta pixel `InitiateCheckout` with the returned `eventId` for dedup (mirror the main app's `EnrollModal` behavior via `@/lib/meta-pixel`), then `window.location.href = paymentUrl`. Handle `alreadyPurchased` (message + link to main-domain OTP).

- [ ] **Step 3: Verify (dev bypass)** — with EPS unset locally, submit the modal; confirm the route returns the direct success URL and the browser navigates to it; confirm an `Order` was created in the DB and (after success route in Task 7) the course is added to `purchasedCourses`.

- [ ] **Step 4: Commit**
```bash
git add course-landing/app/_landing/EnrollModal.tsx course-landing/app/api/enroll
git commit -m "feat(course-subdomain): enroll modal + landing enroll route"
```

---

### Task 7: Payment routes + pages + cross-domain success CTA

**Files:**
- Create: `course-landing/app/api/payment/success/route.ts` (copy of root success route)
- Create: `course-landing/app/api/payment/fail/route.ts` (copy of root fail route)
- Create: `course-landing/app/payment/success/page.tsx`
- Create: `course-landing/app/payment/failed/page.tsx`
- Create: `course-landing/app/payment/processing/page.tsx`

**Interfaces:**
- Consumes: shared `@/lib/eps` (`verifyPayment`, `epsConfigured`), `@/lib/order-fulfillment` (`finalizeSuccessfulOrder`), `@/models/Order`, `@/lib/db`, tracking signals.
- Produces: subdomain payment routes that redirect to subdomain payment pages; a success page whose primary CTA is `https://afnanmahmud.com/auth/otp`.

- [ ] **Step 1: success + fail routes** — copy `app/api/payment/success/route.ts` and `.../fail/route.ts`. They already build redirects from `NEXTAUTH_URL` (subdomain), so they'll route to the subdomain's own `/payment/*` pages. No logic change needed; `finalizeSuccessfulOrder` is DB-only and idempotent.

- [ ] **Step 2: `payment/success/page.tsx`** — light confirmation page (await `searchParams`), reads `course`/`title`/`value`, fires client Purchase pixel with `eid` for dedup, and a prominent **"Continue Learning →"** button linking to `https://afnanmahmud.com/auth/otp`. Secondary text: "আপনার ফোন নম্বর দিয়ে লগইন করলেই কোর্স আনলকড।"

- [ ] **Step 3: `payment/failed/page.tsx` + `payment/processing/page.tsx`** — light pages; failed shows retry (back to `/`), processing polls `/api/payment/status` (copy that route too if the processing page needs it — otherwise show a "verifying, refresh shortly" message and rely on the main app's reconcile cron).

- [ ] **Step 4: Verify** — dev-bypass full funnel end to end: enroll → success route → success page shows, `purchasedCourses` updated in DB, "Continue Learning" points at the main OTP page.

- [ ] **Step 5: Commit**
```bash
git add course-landing/app/api/payment course-landing/app/payment
git commit -m "feat(course-subdomain): payment routes + pages + cross-domain continue-learning CTA"
```

---

### Task 8: Deploy config + docs (pm2, nginx, DNS, env)

**Files:**
- Create: `course-landing/README.md` (build/run/deploy instructions)
- Create: `course-landing/ecosystem.config.js` **or** document the pm2 command (match how the main app is currently run on the VPS)
- Create/append: deploy notes for nginx + DNS + env

**Interfaces:**
- Produces: reproducible deploy steps; no code dependency.

- [ ] **Step 1: README** — document: env (`NEXTAUTH_URL=https://course.afnanmahmud.com` for this process, shares MONGODB_URI/EPS_*/META_*/TIKTOK_*), build order (build fully → then pm2 restart, per project memory), run command `PORT=3001 node course-landing/.next/standalone/course-landing/server.js` (verify exact path from the standalone output).

- [ ] **Step 2: nginx block** — sample `server { server_name course.afnanmahmud.com; location / { proxy_pass http://127.0.0.1:3001; ... } }` + certbot note; DNS `course` A/CNAME to the VPS IP.

- [ ] **Step 3: Verify** — from a clean checkout, follow the README to build; boot the standalone bundle on :3001 and curl it directly (pre-nginx) to confirm shared-module tracing succeeded.

- [ ] **Step 4: Commit**
```bash
git add course-landing/README.md course-landing/ecosystem.config.js
git commit -m "docs(course-subdomain): deploy (pm2 + nginx + DNS + env) instructions"
```

---

## Self-Review

**Spec coverage:** topology (T1), category gate (T2), light landing + orchestration (T3/T4), pricing anchor (T5), enroll funnel (T6), payment + cross-domain handoff (T7), deploy/nginx/DNS/env (T8), reconcile-via-main-cron (noted T7). All spec sections mapped.

**Placeholder scan:** section-component JSX is specified by prop shape + porting source (exact paths) rather than full pasted markup, because the implementer builds original light UI from the referenced dark components and typed data — acceptable given no test harness and same-session execution. Config/route tasks give exact requirements.

**Type consistency:** section prop shapes reuse `SegmentContent` sub-types from `@/app/ai-for-developers/_landing/content`, so data flows unchanged; `useSegment`/`useEnroll` signatures are stable across T2/T3/T6.
