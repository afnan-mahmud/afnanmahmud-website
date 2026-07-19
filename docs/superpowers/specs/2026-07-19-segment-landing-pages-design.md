# Design: 5 Audience-Segment Landing Pages for AI-for-Developers

**Date:** 2026-07-19
**Status:** Approved — ready for implementation planning

## Goal

Build five separate, deeply-customized landing pages for the flagship
`ai-for-developers` course — one per audience segment. Each page speaks to that
segment's specific mindset (its own hero, pain-points, section order, accent
theme, testimonials framing, and FAQ), while funneling into the **same** course
enroll flow (same `ai-for-developers` slug, same ৳990 price, same
`EnrollModal`).

Purpose: run segment-targeted ad campaigns and learn which audience converts
best. Attribution is URL-based (Meta Ads breaks conversions down by
landing-page URL) — **no API/DB/Order changes**.

## Segments (final)

1. **Beginner / non-coder** — "coding e voy, kintu developer hote chai"
2. **Freelancer** — "AI diye client kaj deliver kore income"
3. **Student / job-seeker** — "portfolio + job preparation"
4. **Entrepreneur / business owner** — "nijer app/website idea nijei banai"
5. **Junior / existing developer** — "AI-first workflow e 10x upgrade"

## Approach (chosen: A — shared template, flagship untouched)

Config-driven shared module. The existing flagship
`app/ai-for-developers/page.tsx` stays **100% untouched** (live converting page —
zero regression risk). The five new pages reuse only the already-exported,
generic primitives from `LandingClient.tsx` and share a new `_landing` module of
parameterized section components driven by a per-segment config object.

Trade-off accepted: some invariant section content (DevStack, Curriculum,
Instructor) is duplicated between the flagship's private sections and the shared
module. This is deliberate — isolating risk from the live page is worth minor
duplication.

## File structure

```
app/ai-for-developers/
  page.tsx                    # FLAGSHIP — DO NOT MODIFY
  LandingClient.tsx           # reuse exported primitives only (no edits)
  EnrollContext.tsx           # reuse as-is
  EnrollModal.tsx             # reuse as-is
  _landing/                   # NEW shared module
    theme.ts                  # SegmentTheme: accent CSS-var palettes per segment
    content.ts                # SegmentContent type + shared/default data
    SegmentLanding.tsx        # template: reads a SegmentContent → renders ordered sections
    sections/
      Hero.tsx
      PainPoints.tsx          # NEW section type — the mindset hook
      Outcomes.tsx            # "ekhane shikhben" (What You Will Learn)
      WhyBest.tsx             # "keno best"
      DevStack.tsx
      Curriculum.tsx
      Audience.tsx            # "kader jonno"
      Instructor.tsx
      Feedback.tsx
      Faq.tsx
      SocialProof.tsx
      Footer.tsx
  segments/
    beginner.ts
    freelancer.ts
    student.ts
    entrepreneur.ts
    developer.ts
  beginner/page.tsx           # metadata + <SegmentLanding content={beginner} />
  freelancer/page.tsx
  student/page.tsx
  entrepreneur/page.tsx
  developer/page.tsx
```

## Reuse boundary

**Reused as-is (imported from existing code, no edits):**
- `Reveal`, `GradientText`, `Navbar`, `CtaBanner` (already prop-driven:
  `headline`, `sub`), `EnrollButton`, `PricingNeon` (same ৳990), `CurriculumJourney`
  content facts, `EnrollProvider` + `EnrollModal` + `VideoDemoModal`,
  `ViewContentTracker`, `WhatsAppFab`, and the `globalStyles`/dark-cyber
  background markup.

**Parameterized (new components in `_landing/sections`, content from config):**
- Hero, PainPoints (new), Outcomes, WhyBest, DevStack, Curriculum, Audience,
  Instructor, Feedback, Faq, SocialProof, Footer.

Note: `PricingNeon`, `Navbar`, `CtaBanner`, `EnrollButton` are consumed directly
from `LandingClient.tsx`. Sections that need per-segment copy are rebuilt in
`_landing/sections` so the flagship is never touched.

## `SegmentContent` config shape (per `segments/*.ts`)

Each segment config object provides:

- `slug` — segment key (`beginner` | `freelancer` | `student` | `entrepreneur` | `developer`)
- `theme` — accent palette key (see themes below)
- `meta` — `{ title, description, ogTitle, ogDescription }` for page `metadata`
- `hero` — `{ headline, subheadline, bodyCopy }`
- `painPoints` — array of `{ pain, flip }` (the mindset hook: problem → reassurance)
- `outcomes` — ordered/emphasized subset + framing of the "what you'll learn" items
- `whyBest` — segment-tuned "why this course" value props
- `audience` — "kader jonno" copy tuned to segment
- `testimonials` — reused review pool, framed/ordered per segment
- `ctaBanners` — `{ headline, sub }[]` for the mid-page CtaBanner reuse
- `faq` — segment-specific Q&A array
- `sectionOrder` — ordered array of section keys controlling page flow

`sectionOrder` is how "deep customize" (different flow/emphasis per page) is
expressed without duplicating layout code. `SegmentLanding.tsx` maps each key to
its section component and renders in order.

## Accent themes (`theme.ts`)

Applied via CSS variables on the page wrapper so each page has a distinct vibe.

| Segment | Accent | Feeling |
|---|---|---|
| Beginner | Emerald / teal (soft, reassuring) | "voy nei, tumi parbe" |
| Freelancer | Amber / gold (money, hustle) | income, client, taka |
| Student | Cyan / indigo (flagship-adjacent, fresh) | career launch |
| Entrepreneur | Violet / fuchsia (bold, visionary) | idea → product |
| Developer | Slate / electric-blue (sharp, technical) | speed, power |

Sections read accent from CSS vars (e.g. `--seg-accent`, `--seg-accent-2`) rather
than hard-coded `cyan/indigo`, so the same component renders in each segment's
palette.

## Per-segment creative direction

### 1. Beginner (`/ai-for-developers/beginner`) — theme: emerald
- **Hero:** "Coding ekdom jaanen na? Somossa nei — AI-i apnar programmer." Fear-removal first.
- **PainPoints:** "programming mane hijibiji code" / "tutorial kine porini" / "boyosh-background niye chinta" → each flipped with reassurance.
- **Order:** Hero → PainPoints → WhyBest (beginner-friendly first) → Outcomes → Curriculum → Audience → Feedback → Pricing → Faq.
- **FAQ focus:** "ami kichui jani na, parbo?", "boyosh beshi", "computer basic".

### 2. Freelancer (`/ai-for-developers/freelancer`) — theme: amber
- **Hero:** "AI ke junior developer banie client project deliver korun — 10x faster." ROI/income framing.
- **PainPoints:** "skill nei bole bid korte parina" / "kaj peleo deliver e deri" / "ekar pokkhe full project kothin" → flipped to fast delivery.
- **Order:** Hero → PainPoints → Outcomes (freelance delivery emphasis) → DevStack (client-ready tools) → Curriculum → Feedback (earnings framing) → Pricing → Faq.
- **FAQ focus:** "kotota fast kaj hoy?", "client ke kivabe deliver?", "marketplace e cholbe?".

### 3. Student / job-seeker (`/ai-for-developers/student`) — theme: cyan/indigo
- **Hero:** "Porashonar pashapashi AI-era developer hoye uthun — portfolio banie job-ready hon."
- **PainPoints:** "degree ache kintu skill nei" / "job e experience chay" / "ki diye shuru bujhi na" → flipped to portfolio + job prep.
- **Order:** Hero → PainPoints → Outcomes (portfolio/job emphasis) → Curriculum (career module highlighted) → DevStack → Instructor (credibility) → Feedback → Pricing → Faq.
- **FAQ focus:** "job pete help korbe?", "porashonar sathe manage?", "certificate?".

### 4. Entrepreneur / business owner (`/ai-for-developers/entrepreneur`) — theme: violet
- **Hero:** "Apnar app/website idea — developer hire na kore nijei AI diye banie felun." Cost/control framing.
- **PainPoints:** "developer hire dami" / "idea ache technical partner nei" / "MVP banate mash lage" → flipped to self-built MVP.
- **Order:** Hero → PainPoints → Outcomes (idea→live product) → Curriculum (SaaS/deploy emphasis) → Instructor (founder credibility: Gowaay/Niyoog/Sujog ventures) → Feedback → Pricing → Faq.
- **FAQ focus:** "non-technical hoyeo parbo?", "koto tay MVP?", "scale korte parbo?".

### 5. Junior / existing developer (`/ai-for-developers/developer`) — theme: slate/electric-blue
- **Hero:** "Already code koren? AI-first workflow diye 10x druto + mobile app dhorun." Speed/power, no beginner hand-holding.
- **PainPoints:** "AI tools ache proper workflow nei" / "mobile app kokhono banai ni" / "existing project maintain slow" → flipped to pro workflow.
- **Order:** Hero → DevStack FIRST (tech credibility upfront) → PainPoints → Outcomes (advanced: security, deploy, mobile) → Curriculum → Feedback → Pricing → Faq. (Skips heavy beginner-reassurance.)
- **FAQ focus:** "ami already jani, notun ki?", "kon stack?", "advanced topics?".

## Copy

All copy authored by Claude in **Bangla script** matching the flagship page's
tone. User reviews/edits after build. Copy lives entirely in `segments/*.ts`
configs — no copy hard-coded in section components.

## Enroll / tracking / SEO

- **Enroll:** unchanged. `EnrollProvider` wraps each page; `EnrollModal` posts
  `{ name, phone, slug: 'ai-for-developers' }` to `/api/enroll/landing` as today.
- **Tracking:** each page mounts `ViewContentTracker` (same content id) + inherits
  the root-layout Meta Pixel. Per-segment conversion attribution comes free from
  distinct URLs in Meta Ads reporting.
- **SEO:** each `page.tsx` exports its own `metadata` from the segment config's
  `meta`.

## Out of scope (YAGNI)

- No changes to `/api/enroll/landing`, `Order` model, or admin.
- No new pricing/course records.
- No A/B splitting infra — separate URLs suffice.
- Flagship page untouched.

## Testing / verification

No test framework in repo. Verification is manual:
- `npm run build` passes (all 5 routes compile, no type errors).
- `npm run lint` clean.
- Each of the 5 routes renders; enroll modal opens and submits;
  distinct accent theme visible; correct segment copy and section order.
- Visual check in dev server (`npm run dev`) per page.
```
