# AI for Developers — Course Plan & Memory

> Reference for building out the detailed lesson curriculum. Source of truth = the landing page
> (`app/ai-for-developers/page.tsx`) + course data model (`scripts/seed-ai-for-developers.ts`).
> Last observed: 2026-06-09.

## Course meta (from landing page + seed)
- **Slug:** `ai-for-developers` (standalone landing, NOT under `(public)`)
- **Title:** AI for Developers
- **Price shown on landing:** ৳990 (strikethrough ৳5000). Seed file sets ৳990 — *price mismatch to confirm with Afnan.*
- **Level:** intermediate
- **Promise (hero):** "AI দিয়ে সম্পূর্ণ Custom Website and Mobile App বানান।" — fully free tools, zero → production-grade. Outcome: get a job as a Software Engineer + handle client (existing or new) projects.
- **Tools taught (all free tier):** AntiGravity, Google Gemini (updated model), Claude Code, Cursor IDE.
- **Positioning:** Escape "Tutorial Hell" → build real production-grade apps. Gamified as 7 levels (zero → live server).
- **What's included (pricing card):** All 7 modules, Real SaaS source code (GitHub), Private community, AI Prompts secret library, Lifetime access & updates.

## The 7 Modules (verbatim from `CurriculumJourney`)

**Module 1 — The Modern AI Dev Stack Setup**
- Cursor IDE & Claude Code সেটাপ
- Gemini's updated model ইন্টিগ্রেশন (Free tier)
- AntiGravity workflow এর বেসিক
- সব ফ্রি টুলস দিয়ে প্রো-লেভেলের এনভায়রনমেন্ট তৈরি

**Module 2 — Project Architecture & DB Design**
- SaaS আইডিয়া জেনারেট এবং ফিচার প্ল্যানিং
- Gemini দিয়ে Database Schema & API structure জেনারেট
- AntiGravity স্ট্যাক দিয়ে প্রজেক্টের বেইস তৈরি
- ফ্রি AI টুলস দিয়ে System Design

**Module 3 — Frontend Generation with Claude**
- React/Next.js কম্পোনেন্ট প্রম্পটিং
- Claude Code দিয়ে রিয়েল-টাইম UI জেনারেট
- Responsive design & State management অটোমেশন
- UI বাগ ফিক্সিং

**Module 4 — Backend, Database & Logic Mastery**
- Robust API এবং ব্যাকএন্ড লজিক স্ক্র্যাচ থেকে
- Gemini এর অ্যাডভান্সড রিজনিং দিয়ে DB অপটিমাইজেশন
- Frontend এর সাথে Backend কানেকশন
- AntiGravity দিয়ে ফাস্ট ব্যাকএন্ড ডেভেলপমেন্ট

**Module 5 — Debugging & Version Control (GitHub)**
- The 'Error Loop' — AI error দিলে কিভাবে ফিক্স করবেন
- GitHub এ প্রজেক্ট পুশ এবং ভার্সন কন্ট্রোল
- Error logs পড়া এবং AI কে ফিডব্যাক দেওয়া
- Code refactoring

**Module 6 — Building the Production SaaS**
- AntiGravity, Gemini, Claude একসাথে করে ফুল প্রজেক্ট
- User authentication & dashboard
- Zero থেকে Production-ready কোডবেস
- Final polish & UX improvements

**Module 7 — Live Server Deployment & Career**
- Vercel/Render এ ফ্রি সার্ভারে প্রজেক্ট লাইভ করা
- GitHub actions দিয়ে CI/CD অটোমেশন
- পোর্টফোলিও তৈরি এবং জবের প্রস্তুতি
- ফ্রিল্যান্স ক্লায়েন্ট ডেলিভারি সিক্রেটস

## ⚠️ Gap to resolve with Afnan
Afnan's described scope = **custom website → mobile app → server deploy → Play Store & App Store live → career guideline.** The hero headline promises "Custom Website **and Mobile App**," but the current 7 modules are **web/SaaS-focused only** — there is **no explicit mobile-app build, no Play Store / App Store publishing** content in the module list. Module 7 covers web deploy (Vercel/Render) + career, not mobile store submission.
Decide before writing lessons: (a) fold mobile-app + store-publishing into the existing 7 modules, or (b) keep 7 web modules and add mobile/store as extra lessons within M3/M6/M7. The lesson breakdown must cover EVERY topic step-by-step so a learner ends with a live website AND a published mobile app.

## Data model (where lessons will live) — `scripts/seed-ai-for-developers.ts`
`Course.curriculum` = array of **sections**, each:
```
{ sectionTitle: string, lessons: [ { _id: string, title: string, videoId: string, duration?: string, isPreview?: boolean } ] }
```
Currently the seed creates the course with **no curriculum** (empty). Next step = design the full section→lesson tree, then seed it. Module = section; topics = individual lessons.
