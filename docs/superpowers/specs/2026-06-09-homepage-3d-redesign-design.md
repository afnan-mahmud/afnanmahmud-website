# Homepage 3D Redesign — Design Spec

**Date:** 2026-06-09
**Owner:** Afnan Mahmud
**Status:** Approved (design), pending implementation plan

## Goal

Redesign the public homepage (`app/(public)/page.tsx`) into a modern, professional
landing page that:

1. Positions Afnan as a **Senior Full-Stack Engineer (5+ years)** — credible "hire me"
   developer-for-hire identity, AND as a course instructor (students target). Dual audience.
2. Uses a **real WebGL 3D interactive hero** (react-three-fiber) as the centerpiece.
3. Pulls **real numbers from the database** (no fabricated stats) — e.g. live
   `enrolledCount`. Social proof leans on real experience + real companies/projects.
4. Adopts modern UI patterns inspired by 21st.dev: glassmorphism, gradient borders,
   bento grids, scroll-reveal, magnetic buttons, animated marquee, 3D-tilt cards.

## Profile data (source of truth)

- **Title:** Senior Full-Stack Engineer
- **Experience:** 5+ years
- **Roles:** Agency owner of **Cholo Bohudur**; international freelance.
- **Companies / clients / projects:** Grameenphone, Cholo Bohudur, Thaka Jabe, Gowaay
- **GitHub:** `afnan-mahmud` (https://github.com/afnan-mahmud) — only social link to show
- **Tech stack:**
  - Frontend: React, Next.js
  - Backend: Node.js, Express, NestJS, Python
  - Database: MongoDB, PostgreSQL
  - DevOps: Docker, AWS, VPS
  - Mobile: React Native, Flutter
- **No fake metrics.** Student count is pulled live from DB; "5+ years" and project
  count are real and static.

## Visual language

- Keep existing **dark theme** (`#0a0a0a` / `#0d0d0d` backgrounds) and the indigo →
  cyan → violet accent palette (`#6366f1`, `#22d3ee`, `#a78bfa`).
- Fonts: **Space Grotesk** (headings) + **Inter** (body) — already in use.
- Add polish: glassmorphism panels, gradient/animated borders, subtle noise texture,
  scroll-reveal (framer-motion `useInView`), magnetic CTA buttons, 3D-tilt on cards.

## Section architecture (top → bottom)

Each section is its own component in `components/home/`. The page composes them.

1. **Hero3D** (`components/home/Hero.tsx` rewritten + `components/home/hero3d/` for the
   R3F scene)
   - **3D centerpiece — "Interactive Tech Orbit" (Option A):** a mouse-reactive
     distorted glass icosahedron/sphere at center, with floating 3D tech badges
     (React, Node, Mongo, Docker, etc.) orbiting it. Slow auto-rotate; mouse movement
     drives parallax + distortion. Photo (`/mentor.jpeg`) presented in a glass card.
   - Dual headline conveying engineer + educator.
   - Two CTAs: **Explore Courses** (`#courses` / `/courses`, students) and
     **Work With Me** (`/contact`, clients).
   - Stat row (all honest): live **student count** (from DB; hidden/relabelled if 0 at
     launch), **5+ years experience**, **flagship projects** (= count of real listed
     projects, currently 4).
   - 3D scene loaded via `next/dynamic` with `ssr: false`; degrades on mobile
     (reduced particle/badge count, respects `prefers-reduced-motion`).

2. **TrustedBy** (`components/home/TrustedBy.tsx`)
   - "Building products for" + animated marquee of monochrome text logos:
     Grameenphone · Cholo Bohudur · Thaka Jabe · Gowaay.

3. **Experience** (`components/home/Experience.tsx`)
   - Senior Full-Stack Engineer narrative: 5+ years, agency owner (Cholo Bohudur),
     international freelance. Short bio + a compact experience timeline with 3D-tilt cards.

4. **TechStack** (`components/home/TechStack.tsx`)
   - **Bento grid** grouping: Frontend, Backend, Database, DevOps, Mobile.
   - Hover glow + subtle tilt; lucide / text tech tags.

5. **FeaturedProjects** (`components/home/FeaturedProjects.tsx`)
   - 3D-tilt cards for Grameenphone, Cholo Bohudur, Thaka Jabe, Gowaay.
   - Each: name, one-line description, stack tags. (Links optional — omitted unless provided.)

6. **FeaturedCourse** (`components/home/FeaturedCourse.tsx` — redesigned)
   - The AI-for-developers course, modern card. Keeps DB thumbnail prop.

7. **WhyAfnan** (`components/home/WhyAfnan.tsx` — restyled to match)
   - Real-world projects, Bangla explanation, lifetime access, community support.

8. **Testimonials** (`components/home/Testimonials.tsx` — restyled)
   - Marquee/grid of testimonials.

9. **DualCTA** (`components/home/CtaBanner.tsx` rewritten → split CTA)
   - Split panel: **Learn with me** (enroll → `/courses`) | **Hire me** (→ `/contact`).

## Data flow

- `app/(public)/page.tsx` stays a server component. It calls `connectDB()` and fetches:
  - Featured course (`slug: 'ai-for-developers'`) — `thumbnail`, `enrolledCount`.
  - Aggregate live student count (sum of `enrolledCount` across published courses, or the
    featured course's count — decide in plan; default: featured course `enrolledCount`).
  - Published course count (for "courses" stat if used).
- Props passed down to `Hero` (student count, projects-shipped constant) and
  `FeaturedCourse` (thumbnail). Projects-shipped is a static real number (set to a
  conservative true value, e.g. count of listed flagship projects or a known total —
  finalize in plan).

## 3D technical approach

- **Deps:** `@react-three/fiber`, `three`, `@react-three/drei` (versions compatible with
  React 19 / Next 16 — verify in plan).
- Scene is a **client component** under `components/home/hero3d/`, imported into `Hero`
  via `next/dynamic({ ssr: false })` with a static fallback (CSS gradient + photo) so the
  hero renders instantly and is SSR-safe.
- Performance: instanced/limited geometry, `dpr` clamp, pause render when offscreen,
  `prefers-reduced-motion` → static fallback, mobile → fewer orbiting badges.

## Out of scope

- No changes to other pages (`/about`, `/courses`, `/contact`), nav, or footer beyond
  what the homepage imports.
- No new backend routes. Reuses existing `Course` model + `connectDB()`.
- Cloudinary / uploads untouched.

## Success criteria

- Homepage renders SSR-safe; 3D hero loads progressively without layout shift.
- All stats shown are real (live DB or true static values); no invented metrics.
- Both audiences served: clear "Explore Courses" and "Work With Me → /contact" paths.
- `npm run build` passes; no console errors; mobile + reduced-motion degrade gracefully.
