# 5 Audience-Segment Landing Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship five deeply-customized landing pages (`/ai-for-developers/{beginner,freelancer,student,entrepreneur,developer}`) for the same `ai-for-developers` course, each tuned to one audience segment's mindset, without touching the live flagship page.

**Architecture:** A config-driven shared module (`app/ai-for-developers/_landing/`) of parameterized section components plus a `SegmentLanding` template. Each segment is a plain data config (`segments/*.ts`) providing copy, section order, and accent theme. Segment pages are thin server components: fetch enrolled count → render `<SegmentLanding content={config} enrolledLabel=... />`. The flagship `page.tsx` is never modified; only its already-exported primitives are reused.

**Tech Stack:** Next.js 16 App Router (server components + `'use client'` islands), React 19, Tailwind v4, lucide-react, TypeScript. Enroll funnel + Meta tracking reused unchanged.

## Global Constraints

- **Next.js 16:** `params`/`searchParams` are Promises; consult `node_modules/next/dist/docs/` before framework code. Segment pages take no dynamic params (static routes), so this mainly affects nothing here — but do NOT introduce `[segment]` dynamic routing; use five explicit static route folders.
- **No test framework exists.** Verification per task = `npm run build` passes + `npm run lint` clean + dev-server visual check. Never write unit tests or claim tests pass.
- **Flagship untouched:** `app/ai-for-developers/page.tsx` and `LandingClient.tsx` get **zero edits**. Reuse their exports by import only. If a change to them seems needed, stop and reconsider — the parameterized copy belongs in the new module.
- **Copy language:** Bangla script (not Banglish), matching the flagship's tone. All copy lives in `segments/*.ts` — never hard-coded inside section components.
- **Course/price:** same `ai-for-developers` slug, ৳990. No changes to `/api/enroll/landing`, `Order`, or admin.
- **Attribution:** URL-based only (distinct routes). No tracking-code changes beyond mounting the existing `ViewContentTracker`.
- **Path alias:** `@/*` maps to repo root. Reuse existing components via `../LandingClient`, `../EnrollContext`, `@/components/...`.
- **Dev server gotcha:** if edits don't reflect, `pkill -f "next dev"; rm -rf .next/dev .next/cache; npm run dev` — do not re-edit correct files.

---

## File Structure

```
app/ai-for-developers/
  _landing/
    theme.ts                 # SEGMENT_THEMES: accent CSS-var maps per segment key
    content.ts               # SegmentContent + sub-types (data only, no JSX)
    SegmentLanding.tsx        # 'use client' wrapper composing sections by sectionOrder
    sections/
      Hero.tsx               # NEW parameterized hero
      PainPoints.tsx         # NEW mindset-hook section
      Outcomes.tsx           # mirrors flagship WhatYouWillLearn
      WhyBest.tsx            # mirrors flagship WhyAIWorkflow
      DevStack.tsx           # mirrors flagship DevStack
      Curriculum.tsx         # mirrors flagship CurriculumJourney
      Audience.tsx           # mirrors flagship TargetAudience
      Instructor.tsx         # mirrors flagship InstructorProfile
      Feedback.tsx           # mirrors flagship StudentFeedback
      Faq.tsx               # mirrors flagship FAQDark (parameterized Q&A)
      SocialProof.tsx        # mirrors flagship SocialProof
      Footer.tsx            # mirrors flagship FooterDark
  segments/
    beginner.ts  freelancer.ts  student.ts  entrepreneur.ts  developer.ts
  beginner/page.tsx  freelancer/page.tsx  student/page.tsx
  entrepreneur/page.tsx  developer/page.tsx
```

**Client/server split:** `Reveal` and the enroll context are client. `SegmentLanding.tsx` is a `'use client'` component (it wires `EnrollProvider` + section composition). Section components can be plain functions rendering `Reveal` children (they inherit the client boundary from `SegmentLanding`). Segment `page.tsx` files are **server** components (async, fetch enrolled count) that render the client `SegmentLanding` — same pattern as flagship `page.tsx` rendering client `Navbar`/`Hero`.

**Icons in config:** lucide component refs imported into `.ts` configs are fine (no JSX). Headlines are string-triple (`lead`/`accent`/`trail`) so configs stay JSX-free `.ts` files; sections wrap `accent` in `<GradientText>`.

---

### Task 1: Theme system + content types

**Files:**
- Create: `app/ai-for-developers/_landing/theme.ts`
- Create: `app/ai-for-developers/_landing/content.ts`

**Interfaces:**
- Produces: `SegmentKey`, `SEGMENT_THEMES: Record<SegmentKey, ThemeVars>`, `themeStyle(key): React.CSSProperties`; and all `content.ts` types (`SegmentContent`, `HeroContent`, `PainPoint`, `OutcomeItem`, `ValueItem`, `AudienceItem`, `Testimonial`, `CtaBannerContent`, `FaqItem`, `SectionKey`).

- [ ] **Step 1: Write `theme.ts`**

```ts
import type { CSSProperties } from 'react';

export type SegmentKey =
  | 'beginner' | 'freelancer' | 'student' | 'entrepreneur' | 'developer';

// Two accent colors per segment, as raw RGB triples so we can build rgba()
// glows in CSS vars. `accent` = primary, `accent2` = secondary/gradient end.
type ThemeVars = { accent: string; accent2: string };

export const SEGMENT_THEMES: Record<SegmentKey, ThemeVars> = {
  beginner:     { accent: '16 185 129', accent2: '20 184 166' },   // emerald / teal
  freelancer:   { accent: '245 158 11', accent2: '234 88 12' },    // amber / orange
  student:      { accent: '34 211 238', accent2: '99 102 241' },   // cyan / indigo
  entrepreneur: { accent: '139 92 246', accent2: '217 70 239' },   // violet / fuchsia
  developer:    { accent: '56 189 248', accent2: '99 102 241' },   // sky / indigo
};

// Inline style object exposing the accent as CSS vars on the page wrapper.
// Sections reference these via arbitrary Tailwind values, e.g.
// text-[rgb(var(--seg-accent))] or shadow-[0_0_20px_rgba(var(--seg-accent)/0.3)].
export function themeStyle(key: SegmentKey): CSSProperties {
  const t = SEGMENT_THEMES[key];
  return {
    ['--seg-accent' as string]: t.accent,
    ['--seg-accent-2' as string]: t.accent2,
  };
}
```

- [ ] **Step 2: Write `content.ts`**

```ts
import type { ComponentType } from 'react';
import type { SegmentKey } from './theme';

export type IconType = ComponentType<{ size?: number | string; className?: string }>;

export type SectionKey =
  | 'socialProof' | 'painPoints' | 'outcomes' | 'whyBest' | 'devStack'
  | 'curriculum' | 'audience' | 'instructor' | 'feedback' | 'faq'
  | 'cta1' | 'cta2';

export type HeroContent = {
  headlineLead: string;    // rendered before the gradient word
  headlineAccent: string;  // rendered inside <GradientText>
  headlineTrail?: string;  // rendered after
  subheadline: string;
  bodyCopy: string;
};

export type PainPoint = { pain: string; flip: string };
export type OutcomeItem = { icon: IconType; title: string; desc: string };
export type ValueItem = { icon: IconType; title: string; desc: string };
export type AudienceItem = { icon: IconType; title: string; desc: string };
export type Testimonial = {
  name: string; initials: string; gradient: string; text: string; role?: string;
};
export type CtaBannerContent = { headlineLead: string; headlineAccent: string; headlineTrail?: string; sub: string };
export type FaqItem = { q: string; a: string };

export type SegmentContent = {
  key: SegmentKey;
  meta: { title: string; description: string; ogTitle: string; ogDescription: string };
  sectionOrder: SectionKey[];
  hero: HeroContent;
  painPoints: { heading: string; items: PainPoint[] };
  outcomes: { heading: string; sub: string; items: OutcomeItem[] };
  whyBest: { heading: string; items: ValueItem[] };
  audience: { heading: string; items: AudienceItem[] };
  feedback: { heading: string; sub: string; items: Testimonial[] };
  cta1: CtaBannerContent;
  cta2: CtaBannerContent;
  faq: { heading: string; items: FaqItem[] };
};
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors from the two new files (pre-existing repo errors, if any, unrelated).

- [ ] **Step 4: Commit**

```bash
git add app/ai-for-developers/_landing/theme.ts app/ai-for-developers/_landing/content.ts
git commit -m "feat(landing): segment theme + content types"
```

---

### Task 2: New sections — Hero + PainPoints

**Files:**
- Create: `app/ai-for-developers/_landing/sections/Hero.tsx`
- Create: `app/ai-for-developers/_landing/sections/PainPoints.tsx`

**Interfaces:**
- Consumes: `HeroContent`, `PainPoint` from `../content`; `Reveal`, `GradientText`, `EnrollButton` from `../../LandingClient`.
- Produces: `Hero({ content }: { content: HeroContent })`, `PainPoints({ heading, items }: { heading: string; items: PainPoint[] })`.

Both are non-`'use client'` function components rendering client `Reveal` children (boundary comes from `SegmentLanding`). Accent colors come from CSS vars — use `rgb(var(--seg-accent))` / `rgb(var(--seg-accent-2))` in arbitrary Tailwind values, NOT hard-coded `cyan`/`indigo`.

- [ ] **Step 1: Write `Hero.tsx`**

```tsx
import { Rocket } from 'lucide-react';
import { Reveal, GradientText, EnrollButton } from '../../LandingClient';
import type { HeroContent } from '../content';

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden border-b border-slate-800/50 min-h-[85vh] flex items-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="max-w-3xl">
          <Reveal delay={200} direction="right">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4 leading-[1.1] text-white">
              {content.headlineLead}{' '}
              <GradientText>{content.headlineAccent}</GradientText>
              {content.headlineTrail ? <> {content.headlineTrail}</> : null}
            </h1>
          </Reveal>
          <Reveal delay={300} direction="right">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-6 leading-snug text-slate-200">
              {content.subheadline}
            </p>
          </Reveal>
          <Reveal delay={400} direction="right">
            <p className="mt-5 max-w-2xl text-[15px] sm:text-base md:text-lg text-slate-300/90 leading-relaxed sm:leading-loose tracking-wide [text-wrap:pretty] border-l-2 pl-4 sm:pl-5" style={{ borderColor: 'rgb(var(--seg-accent) / 0.4)' }}>
              {content.bodyCopy}
            </p>
          </Reveal>
          <Reveal delay={500} direction="right">
            <div className="mt-8 flex items-center gap-2 text-slate-400 text-sm">
              <Rocket size={16} style={{ color: 'rgb(var(--seg-accent))' }} />
              <span>এই কোর্সে ভর্তি হয়ে আজই শুরু করুন — মাত্র ৳৯৯০</span>
            </div>
            <EnrollButton className="mt-6" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write `PainPoints.tsx`**

```tsx
import { X, Check } from 'lucide-react';
import { Reveal, GradientText } from '../../LandingClient';
import type { PainPoint } from '../content';

export function PainPoints({ heading, items }: { heading: string; items: PainPoint[] }) {
  return (
    <section className="py-24 relative overflow-hidden border-t border-slate-800/50 bg-[#060b19]">
      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-black mb-14 text-white text-center">
            <GradientText>{heading}</GradientText>
          </h2>
        </Reveal>
        <div className="space-y-5">
          {items.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="grid md:grid-cols-2 gap-4 items-stretch">
                <div className="glass-panel rounded-2xl border border-slate-800 p-5 flex items-start gap-3">
                  <X size={20} className="text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-slate-300 leading-relaxed [text-wrap:pretty]">{p.pain}</p>
                </div>
                <div className="rounded-2xl border p-5 flex items-start gap-3"
                  style={{ borderColor: 'rgb(var(--seg-accent) / 0.4)', background: 'rgb(var(--seg-accent) / 0.06)' }}>
                  <Check size={20} className="shrink-0 mt-0.5" style={{ color: 'rgb(var(--seg-accent))' }} />
                  <p className="text-slate-100 font-medium leading-relaxed [text-wrap:pretty]">{p.flip}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/ai-for-developers/_landing/sections/Hero.tsx app/ai-for-developers/_landing/sections/PainPoints.tsx
git commit -m "feat(landing): Hero + PainPoints sections"
```

---

### Task 3: Mirror sections — Outcomes, WhyBest, Audience, Faq

**Files:**
- Create: `app/ai-for-developers/_landing/sections/Outcomes.tsx`
- Create: `app/ai-for-developers/_landing/sections/WhyBest.tsx`
- Create: `app/ai-for-developers/_landing/sections/Audience.tsx`
- Create: `app/ai-for-developers/_landing/sections/Faq.tsx`

**Interfaces:**
- Consumes: `OutcomeItem`, `ValueItem`, `AudienceItem`, `FaqItem` from `../content`; `Reveal`, `GradientText`, `EnrollButton` from `../../LandingClient`.
- Produces: `Outcomes({ heading, sub, items })`, `WhyBest({ heading, items })`, `Audience({ heading, items })`, `Faq({ heading, items })`.

Each mirrors an existing flagship section's markup — **open the flagship source and copy the JSX structure, then swap hard-coded content for props and swap hard-coded `cyan`/`indigo` accent utility classes for the CSS-var inline-style pattern** used in Task 2. Source references:
- `Outcomes` ⟵ `WhatYouWillLearn`, `app/ai-for-developers/page.tsx:288-377`. Replace the local `outcomes` array with the `items` prop; heading text ← `heading`; sub-paragraph ← `sub`. Keep `EnrollButton` at bottom. The last item spanning two columns: keep `i === items.length - 1 ? 'md:col-span-2' : ''`.
- `WhyBest` ⟵ `WhyAIWorkflow`, `page.tsx:379-437`. Replace `values` with `items`; heading ← `heading` (wrap final word in `<GradientText>` — put the whole heading string in and let config include the emphasis by convention: render `<GradientText>{heading}</GradientText>`). Keep the flex-wrap card grid and trailing `EnrollButton`.
- `Audience` ⟵ `TargetAudience`, `page.tsx:548-595`. Replace `audiences` with `items`; heading ← `heading`.
- `Faq` ⟵ `FAQDark`, `LandingClient.tsx:723-776`. Replace its hard-coded FAQ array with `items` (`{ q, a }`); heading ← `heading`. Preserve the accordion open/close behavior (it is a `'use client'` component using `useState`; keep `'use client'` at top of `Faq.tsx`). Keep `id="faq"` and `scroll-mt` so the navbar anchor works.

For every section, replace accent utility classes (`text-cyan-400`, `border-cyan-500/30`, `bg-indigo-500/20`, `shadow-[0_0_20px_rgba(99,102,241,0.2)]`, gradient `from-cyan-500 to-indigo-600`) with the inline-style CSS-var pattern:
`style={{ color: 'rgb(var(--seg-accent))' }}`, `style={{ borderColor: 'rgb(var(--seg-accent) / 0.3)' }}`, `style={{ background: 'rgb(var(--seg-accent) / 0.1)' }}`, and for gradients `style={{ backgroundImage: 'linear-gradient(to right, rgb(var(--seg-accent)), rgb(var(--seg-accent-2)))' }}`. Neutral slate classes stay as-is.

- [ ] **Step 1: Write the four section files** following the mirror-and-parameterize instructions above. `Faq.tsx` starts with `'use client'`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/ai-for-developers/_landing/sections/Outcomes.tsx app/ai-for-developers/_landing/sections/WhyBest.tsx app/ai-for-developers/_landing/sections/Audience.tsx app/ai-for-developers/_landing/sections/Faq.tsx
git commit -m "feat(landing): Outcomes, WhyBest, Audience, Faq sections"
```

---

### Task 4: Invariant sections — DevStack, Curriculum, Instructor, Feedback, SocialProof, Footer

**Files:**
- Create: `app/ai-for-developers/_landing/sections/DevStack.tsx`
- Create: `app/ai-for-developers/_landing/sections/Curriculum.tsx`
- Create: `app/ai-for-developers/_landing/sections/Instructor.tsx`
- Create: `app/ai-for-developers/_landing/sections/Feedback.tsx`
- Create: `app/ai-for-developers/_landing/sections/SocialProof.tsx`
- Create: `app/ai-for-developers/_landing/sections/Footer.tsx`

**Interfaces:**
- Produces: `DevStack()`, `Curriculum()`, `Instructor()`, `Feedback({ heading, sub, items })`, `SocialProof({ enrolledLabel })`, `Footer()`.
- Consumes: `Testimonial` from `../content`; primitives from `../../LandingClient`.

`DevStack`, `Curriculum`, `Instructor`, `Footer` carry **identical content for all segments** (same tools, same 8-module curriculum, same instructor, same footer) — copy the flagship markup verbatim into standalone components (accept **no** content props), only swapping accent utility classes for the CSS-var pattern so they match each page's theme. Sources:
- `DevStack` ⟵ `page.tsx:439-546` (verbatim content).
- `Curriculum` ⟵ `CurriculumJourney`, `LandingClient.tsx:409-582` (verbatim 8 modules). Keep `id="journey"` anchor.
- `Instructor` ⟵ `InstructorProfile`, `page.tsx:597-704` (verbatim, incl. `/mentor.jpeg` and the four ventures). Keep `id="instructor"` anchor.
- `Footer` ⟵ `FooterDark`, `page.tsx:706-751` (verbatim).

`Feedback` ⟵ `StudentFeedback`, `page.tsx:205-286`: parameterize the `reviews` array ← `items`, heading ← `heading`, sub ← `sub`. Keep `id="feedback"` anchor + the "+৫২ জন আরো ফিডব্যাক" line.

`SocialProof` ⟵ `page.tsx:163-201`: parameterize `enrolledLabel` (already a prop in flagship). Swap accent classes for CSS vars.

- [ ] **Step 1: Write the six section files** per the mirror instructions.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/ai-for-developers/_landing/sections/DevStack.tsx app/ai-for-developers/_landing/sections/Curriculum.tsx app/ai-for-developers/_landing/sections/Instructor.tsx app/ai-for-developers/_landing/sections/Feedback.tsx app/ai-for-developers/_landing/sections/SocialProof.tsx app/ai-for-developers/_landing/sections/Footer.tsx
git commit -m "feat(landing): invariant + feedback/socialproof/footer sections"
```

---

### Task 5: SegmentLanding template

**Files:**
- Create: `app/ai-for-developers/_landing/SegmentLanding.tsx`

**Interfaces:**
- Consumes: all section components; `SegmentContent`, `SectionKey` from `./content`; `themeStyle` from `./theme`; `Navbar`, `CtaBanner`, `PricingNeon`, `GradientText` from `../LandingClient`; `EnrollProvider` from `../EnrollContext`; `ViewContentTracker` from `@/components/tracking/ViewContentTracker`; `WhatsAppFab` from `@/components/whatsapp/WhatsAppFab`.
- Produces: `default SegmentLanding({ content, enrolledLabel }: { content: SegmentContent; enrolledLabel: string })`.

- [ ] **Step 1: Write `SegmentLanding.tsx`**

```tsx
'use client';

import { EnrollProvider } from '../EnrollContext';
import { Navbar, CtaBanner, PricingNeon, GradientText } from '../LandingClient';
import ViewContentTracker from '@/components/tracking/ViewContentTracker';
import WhatsAppFab from '@/components/whatsapp/WhatsAppFab';
import { themeStyle } from './theme';
import type { SegmentContent, SectionKey } from './content';
import { Hero } from './sections/Hero';
import { PainPoints } from './sections/PainPoints';
import { Outcomes } from './sections/Outcomes';
import { WhyBest } from './sections/WhyBest';
import { DevStack } from './sections/DevStack';
import { Curriculum } from './sections/Curriculum';
import { Audience } from './sections/Audience';
import { Instructor } from './sections/Instructor';
import { Feedback } from './sections/Feedback';
import { Faq } from './sections/Faq';
import { SocialProof } from './sections/SocialProof';
import { Footer } from './sections/Footer';

const COURSE_SLUG = 'ai-for-developers';
const COURSE_PRICE = 990;

export default function SegmentLanding({
  content,
  enrolledLabel,
}: {
  content: SegmentContent;
  enrolledLabel: string;
}) {
  const renderSection = (key: SectionKey) => {
    switch (key) {
      case 'socialProof': return <SocialProof key={key} enrolledLabel={enrolledLabel} />;
      case 'painPoints':  return <PainPoints key={key} heading={content.painPoints.heading} items={content.painPoints.items} />;
      case 'outcomes':    return <Outcomes key={key} heading={content.outcomes.heading} sub={content.outcomes.sub} items={content.outcomes.items} />;
      case 'whyBest':     return <WhyBest key={key} heading={content.whyBest.heading} items={content.whyBest.items} />;
      case 'devStack':    return <DevStack key={key} />;
      case 'curriculum':  return <Curriculum key={key} />;
      case 'audience':    return <Audience key={key} heading={content.audience.heading} items={content.audience.items} />;
      case 'instructor':  return <Instructor key={key} />;
      case 'feedback':    return <Feedback key={key} heading={content.feedback.heading} sub={content.feedback.sub} items={content.feedback.items} />;
      case 'faq':         return <Faq key={key} heading={content.faq.heading} items={content.faq.items} />;
      case 'cta1':        return <CtaBanner key={key} headline={<>{content.cta1.headlineLead} <GradientText>{content.cta1.headlineAccent}</GradientText>{content.cta1.headlineTrail ? ` ${content.cta1.headlineTrail}` : ''}</>} sub={content.cta1.sub} />;
      case 'cta2':        return <CtaBanner key={key} headline={<>{content.cta2.headlineLead} <GradientText>{content.cta2.headlineAccent}</GradientText>{content.cta2.headlineTrail ? ` ${content.cta2.headlineTrail}` : ''}</>} sub={content.cta2.sub} />;
      default: return null;
    }
  };

  return (
    <EnrollProvider>
      <div
        className="min-h-screen font-sans bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200"
        style={themeStyle(content.key)}
      >
        <ViewContentTracker contentId={COURSE_SLUG} contentName="AI for Developers" value={COURSE_PRICE} currency="BDT" />

        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/80 to-[#020617]"></div>
        </div>

        <Navbar />

        <main className="relative z-10">
          <Hero content={content.hero} />
          {content.sectionOrder.map(renderSection)}
          <PricingNeon />
        </main>

        <Footer />
        <WhatsAppFab />
      </div>
    </EnrollProvider>
  );
}
```

Note: `Hero` renders first and `PricingNeon` + `Footer` render last on every page (invariant frame); `sectionOrder` controls everything between. `faq` is placed via `sectionOrder` (typically last before pricing) — confirm each config puts `faq` where the navbar `#faq` anchor still lands sensibly.

The `globalStyles` and animation keyframes are injected by the flagship's `<style>` block only on the flagship route. Segment pages need them too — they are added in the page files (Task 6) via a shared inline `<style>`. **Do not** import from flagship `page.tsx`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add app/ai-for-developers/_landing/SegmentLanding.tsx
git commit -m "feat(landing): SegmentLanding template"
```

---

### Task 6: Shared page styles + Beginner segment (walking skeleton)

This task produces the first **rendering** page end-to-end.

**Files:**
- Create: `app/ai-for-developers/_landing/globalStyles.ts` (exported string, copied verbatim from flagship `page.tsx:27-81`)
- Create: `app/ai-for-developers/segments/beginner.ts`
- Create: `app/ai-for-developers/beginner/page.tsx`

**Interfaces:**
- Consumes: `SegmentContent` from `../_landing/content`; `SEGMENT_GLOBAL_STYLES` from `../_landing/globalStyles`; `SegmentLanding` from `../_landing/SegmentLanding`; `connectDB`, `Course`.
- Produces: `beginner: SegmentContent`; default page + `metadata`.

- [ ] **Step 1: Create `globalStyles.ts`** — export the flagship's CSS string:

```ts
// Verbatim copy of the flagship page's <style> contents (animations, glass-panel,
// neon borders, modal keyframes) so segment pages render identically without
// importing from the flagship page module.
export const SEGMENT_GLOBAL_STYLES = `
/* PASTE the exact contents of app/ai-for-developers/page.tsx lines 28-80 here */
`;
```

Paste the exact CSS from `page.tsx:28-80` (the body of the `globalStyles` template literal) between the backticks.

- [ ] **Step 2: Create `segments/beginner.ts`** — full config (theme: emerald). Bangla copy tuned to the beginner mindset ("coding e voy, kintu developer hote chai"). Structure (fill all fields; representative copy shown, expand to real Bangla matching flagship tone):

```ts
import { Brain, MessagesSquare, Wallet, Briefcase, Globe, Smartphone, Bug, ShieldCheck, GitBranch, Rocket, Store, Code } from 'lucide-react';
import type { SegmentContent } from '../_landing/content';

export const beginner: SegmentContent = {
  key: 'beginner',
  meta: {
    title: 'একদম শূন্য থেকে AI দিয়ে ডেভেলপার হন | Afnan Mahmud',
    description: 'কোডিং একদম জানেন না? সমস্যা নেই — AI-ই আপনার প্রোগ্রামার। বিগেনার-ফ্রেন্ডলি রেকর্ডেড কোর্সে শূন্য থেকে অ্যাপ ও ওয়েবসাইট বানানো শিখুন।',
    ogTitle: 'একদম শূন্য থেকে AI দিয়ে ডেভেলপার হন',
    ogDescription: 'কোডিং না জানলেও AI-কে গাইড করে ওয়েবসাইট ও মোবাইল অ্যাপ বানানো শিখুন — একদম বেসিক থেকে।',
  },
  sectionOrder: ['painPoints', 'socialProof', 'whyBest', 'outcomes', 'curriculum', 'audience', 'feedback', 'cta2', 'faq'],
  hero: {
    headlineLead: 'কোডিং ভয়? এবার',
    headlineAccent: 'AI-ই আপনার প্রোগ্রামার',
    subheadline: 'একদম শূন্য থেকে — কোডিং না জেনেও AI-কে গাইড করে নিজের অ্যাপ ও ওয়েবসাইট বানান।',
    bodyCopy: 'বেসিক কম্পিউটার চালাতে জানলে, ইন্টারনেট ব্রাউজ করতে পারলে আর কিবোর্ডে টাইপ করতে পারলেই আপনি এই কোর্সে শুরু করতে পারবেন। কঠিন কোড AI লিখে দেবে, আপনি শুধু বুঝে বুঝে গাইড করবেন।',
  },
  painPoints: {
    heading: 'আপনার এই ভয়গুলোই তো?',
    items: [
      { pain: 'প্রোগ্রামিং মানেই হিজিবিজি কোড দেখে মাথা ঘোরে।', flip: 'কঠিন কোড AI লিখে দেবে — আপনি শুধু কী বানাবেন সেটা গাইড করবেন।' },
      { pain: 'অনেক টিউটোরিয়াল/বই কিনেছি, শেষ করতে পারিনি।', flip: 'স্টেপ বাই স্টেপ ধরে ধরে — একা লাগবে না, সাপোর্ট গ্রুপ সবসময় আছে।' },
      { pain: 'বয়স/ব্যাকগ্রাউন্ড নিয়ে চিন্তা — আমি কি পারব?', flip: 'নন-টেক থেকেও হাজারো স্টুডেন্ট শুরু করেছেন — বেসিক থেকেই শেখানো হয়।' },
    ],
  },
  outcomes: {
    heading: 'এখানে আপনি শিখতে পারবেন',
    sub: 'আইডিয়া থেকে শুরু করে লাইভ অ্যাপ পর্যন্ত — পুরো জার্নিটা AI-কে সাথে নিয়ে, একদম বেসিক থেকে।',
    items: [ /* reuse flagship WhatYouWillLearn items (page.tsx:289-325): Globe, Smartphone, Bug, ShieldCheck, GitBranch, Rocket, Store */ ],
  },
  whyBest: {
    heading: 'এই কোর্সটি কেন বিগেনারদের জন্য বেস্ট?',
    items: [ /* reuse flagship WhyAIWorkflow items (page.tsx:380-406), beginner-friendly first */ ],
  },
  audience: {
    heading: 'এই মিশন কাদের জন্য?',
    items: [ /* reuse flagship TargetAudience items (page.tsx:549-565) */ ],
  },
  feedback: {
    heading: 'স্টুডেন্টদের ফিডব্যাক',
    sub: 'যারা ইতিমধ্যে জয়েন করেছেন — তাদের অভিজ্ঞতা নিজেই পড়ে দেখুন।',
    items: [ /* reuse flagship StudentFeedback reviews (page.tsx:206-237) */ ],
  },
  cta1: { headlineLead: 'পুরোনো নিয়মে আর কত?', headlineAccent: 'Smart way', headlineTrail: '-তে শুরু করুন।', sub: 'AI হবে আপনার সহকারী প্রোগ্রামার, আর আপনি হবেন একজন বিল্ডার।' },
  cta2: { headlineLead: 'শূন্য থেকে', headlineAccent: 'লাইভ অ্যাপ', headlineTrail: '— পুরো প্রসেসটাই এখানে।', sub: '৮টি মডিউল, ৪০+ লেসন, ৫টি রিয়েল প্রজেক্ট — স্টেপ বাই স্টেপ।' },
  faq: {
    heading: 'সাধারণ প্রশ্ন',
    items: [
      { q: 'আমি তো কিছুই জানি না, পারব?', a: 'হ্যাঁ। কোর্স একদম বেসিক থেকে শুরু। বেসিক কম্পিউটার ও ইন্টারনেট ব্যবহার জানলেই যথেষ্ট।' },
      { q: 'বয়স বেশি হয়ে গেছে?', a: 'শেখার কোনো বয়স নেই — অনেক দেরিতে শুরু করা স্টুডেন্টও ভালো করছেন।' },
      { q: 'কোন প্রোগ্রামিং ভাষা লাগবে?', a: 'JavaScript/TypeScript হাতে-কলমে শেখানো হবে; আগে জানা না থাকলেও সমস্যা নেই।' },
      /* add 2-3 more beginner-focused Q&A */
    ],
  },
};
```

For the array fields marked "reuse flagship ... items", copy the exact objects from the referenced flagship line ranges (icon + Bangla title + desc) into the config.

- [ ] **Step 3: Create `beginner/page.tsx`**:

```tsx
import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import SegmentLanding from '../_landing/SegmentLanding';
import { SEGMENT_GLOBAL_STYLES } from '../_landing/globalStyles';
import { beginner } from '../segments/beginner';

export const metadata: Metadata = {
  title: beginner.meta.title,
  description: beginner.meta.description,
  openGraph: { title: beginner.meta.ogTitle, description: beginner.meta.ogDescription, type: 'website' },
};

function enrolledDisplay(count: number): string {
  const rounded = Math.max(500, Math.ceil(count / 500) * 500);
  return `${rounded}+`;
}

export default async function BeginnerLandingPage() {
  await connectDB();
  const course = await Course.findOne({ slug: 'ai-for-developers' })
    .select('enrolledCount')
    .lean<{ enrolledCount?: number }>();
  const enrolledLabel = enrolledDisplay(course?.enrolledCount ?? 0);

  return (
    <>
      <style>{SEGMENT_GLOBAL_STYLES}</style>
      <SegmentLanding content={beginner} enrolledLabel={enrolledLabel} />
    </>
  );
}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds; `/ai-for-developers/beginner` appears in the route list; no type errors.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `http://localhost:3000/ai-for-developers/beginner`.
Expected: page renders with **emerald** accent, beginner hero, PainPoints section, enroll modal opens on "Enroll" click, all sections present in configured order, PricingNeon + Footer at bottom. Fix any accent classes that stayed cyan/indigo.

- [ ] **Step 6: Commit**

```bash
git add app/ai-for-developers/_landing/globalStyles.ts app/ai-for-developers/segments/beginner.ts app/ai-for-developers/beginner/page.tsx
git commit -m "feat(landing): beginner segment page (walking skeleton)"
```

---

### Task 7: Freelancer segment

**Files:**
- Create: `app/ai-for-developers/segments/freelancer.ts`
- Create: `app/ai-for-developers/freelancer/page.tsx`

**Interfaces:**
- Produces: `freelancer: SegmentContent`; page + `metadata`. Page file is identical in shape to Task 6 Step 3 with `beginner` → `freelancer` and folder `freelancer/`.

- [ ] **Step 1: Write `segments/freelancer.ts`** — theme `freelancer` (amber). Mindset: "AI diye client kaj deliver kore income". Follow the beginner config shape. Segment-specific direction:
  - `sectionOrder`: `['painPoints', 'outcomes', 'devStack', 'curriculum', 'feedback', 'cta2', 'faq']`
  - hero: income/ROI framing — accent word e.g. "১০x দ্রুত ক্লায়েন্ট ডেলিভারি"
  - painPoints: skill/bidding/delivery-speed pains flipped to fast AI delivery
  - outcomes: reuse flagship items but sub-copy emphasizes freelance/client delivery
  - feedback: same reviews, sub framed around earning/client work
  - faq: "কত দ্রুত কাজ হয়?", "ক্লায়েন্টকে কীভাবে ডেলিভার?", "মার্কেটপ্লেসে চলবে?"

- [ ] **Step 2: Write `freelancer/page.tsx`** (mirror Task 6 Step 3, swap identifiers/folder).

- [ ] **Step 3: Build** — `npm run build`; expect `/ai-for-developers/freelancer` route, no errors.

- [ ] **Step 4: Visual check** — `/ai-for-developers/freelancer` renders with **amber** accent, freelancer copy, correct section order.

- [ ] **Step 5: Commit**

```bash
git add app/ai-for-developers/segments/freelancer.ts app/ai-for-developers/freelancer/page.tsx
git commit -m "feat(landing): freelancer segment page"
```

---

### Task 8: Student segment

**Files:**
- Create: `app/ai-for-developers/segments/student.ts`
- Create: `app/ai-for-developers/student/page.tsx`

- [ ] **Step 1: Write `segments/student.ts`** — theme `student` (cyan/indigo). Mindset: "portfolio + job prep". Direction:
  - `sectionOrder`: `['painPoints', 'socialProof', 'outcomes', 'curriculum', 'devStack', 'instructor', 'feedback', 'cta2', 'faq']`
  - hero: "পড়াশোনার পাশাপাশি job-ready হন"; accent e.g. "AI-era ডেভেলপার"
  - painPoints: degree-but-no-skill / job-needs-experience / where-to-start → portfolio + job prep
  - faq: "জব পেতে হেল্প করবে?", "পড়াশোনার সাথে ম্যানেজ হবে?", "সার্টিফিকেট?"

- [ ] **Step 2: Write `student/page.tsx`** (mirror Task 6 Step 3).
- [ ] **Step 3: Build** — expect `/ai-for-developers/student` route, no errors.
- [ ] **Step 4: Visual check** — cyan/indigo accent, student copy, order correct.
- [ ] **Step 5: Commit**

```bash
git add app/ai-for-developers/segments/student.ts app/ai-for-developers/student/page.tsx
git commit -m "feat(landing): student segment page"
```

---

### Task 9: Entrepreneur segment

**Files:**
- Create: `app/ai-for-developers/segments/entrepreneur.ts`
- Create: `app/ai-for-developers/entrepreneur/page.tsx`

- [ ] **Step 1: Write `segments/entrepreneur.ts`** — theme `entrepreneur` (violet). Mindset: "nijer idea nijei banai, developer hire na kore". Direction:
  - `sectionOrder`: `['painPoints', 'outcomes', 'curriculum', 'instructor', 'feedback', 'cta2', 'faq']`
  - hero: cost/control — accent e.g. "নিজেই বানিয়ে ফেলুন"
  - painPoints: hiring-is-costly / no-technical-partner / MVP-takes-months → self-built MVP fast
  - instructor: founder-credibility emphasis (Gowaay/Niyoog/Sujog ventures already in Instructor section)
  - faq: "নন-টেকনিক্যাল হয়েও পারব?", "কত টাকায় MVP?", "স্কেল করতে পারব?"

- [ ] **Step 2: Write `entrepreneur/page.tsx`** (mirror Task 6 Step 3).
- [ ] **Step 3: Build** — expect `/ai-for-developers/entrepreneur` route, no errors.
- [ ] **Step 4: Visual check** — violet accent, entrepreneur copy, order correct.
- [ ] **Step 5: Commit**

```bash
git add app/ai-for-developers/segments/entrepreneur.ts app/ai-for-developers/entrepreneur/page.tsx
git commit -m "feat(landing): entrepreneur segment page"
```

---

### Task 10: Developer segment

**Files:**
- Create: `app/ai-for-developers/segments/developer.ts`
- Create: `app/ai-for-developers/developer/page.tsx`

- [ ] **Step 1: Write `segments/developer.ts`** — theme `developer` (sky/electric-blue). Mindset: "already code jani, AI-first workflow e 10x". Direction:
  - `sectionOrder`: `['devStack', 'painPoints', 'outcomes', 'curriculum', 'feedback', 'cta2', 'faq']` (DevStack first = tech credibility upfront; no beginner-reassurance whyBest/audience)
  - hero: speed/power — accent e.g. "১০x দ্রুত"; no hand-holding tone
  - painPoints: no-proper-AI-workflow / never-built-mobile / slow-maintenance → pro AI workflow
  - outcomes: emphasize advanced (security, deploy, mobile, GitHub)
  - faq: "আমি তো জানি, নতুন কী?", "কোন স্ট্যাক?", "অ্যাডভান্সড টপিক?"

- [ ] **Step 2: Write `developer/page.tsx`** (mirror Task 6 Step 3).
- [ ] **Step 3: Build** — expect `/ai-for-developers/developer` route, no errors.
- [ ] **Step 4: Visual check** — sky/electric-blue accent, developer copy, DevStack first.
- [ ] **Step 5: Commit**

```bash
git add app/ai-for-developers/segments/developer.ts app/ai-for-developers/developer/page.tsx
git commit -m "feat(landing): developer segment page"
```

---

### Task 11: Final verification + flagship regression check

**Files:** none (verification only).

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: succeeds; route list contains all five `/ai-for-developers/{beginner,freelancer,student,entrepreneur,developer}` plus the unchanged `/ai-for-developers`.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: clean (no new errors/warnings from added files).

- [ ] **Step 3: Flagship regression**

Confirm `git status` shows **no modifications** to `app/ai-for-developers/page.tsx` or `app/ai-for-developers/LandingClient.tsx`:
Run: `git diff --stat main -- app/ai-for-developers/page.tsx app/ai-for-developers/LandingClient.tsx`
Expected: empty output.

- [ ] **Step 4: Cross-page visual pass**

`npm run dev`; visit all five routes. Verify per page: distinct accent theme, correct hero + section order, enroll modal opens & submits (name+phone → same funnel), WhatsApp FAB present, no console errors, no horizontal scroll on mobile width.

- [ ] **Step 5: Final commit (if any fixups)**

```bash
git add -A
git commit -m "chore(landing): final verification fixups for segment pages"
```

---

## Self-Review Notes

- **Spec coverage:** All 5 segments (Tasks 6–10), config-driven template (Task 5), theme system (Task 1), parameterized sections (Tasks 2–4), reuse boundary honored (imports only, flagship untouched — enforced in Task 11 Step 3), per-page metadata/SEO (each page file), URL-based attribution (distinct static routes; `ViewContentTracker` mounted in template), enroll unchanged (reused `EnrollProvider`/`EnrollModal`). Covered.
- **No dynamic route:** explicit static folders per Global Constraints (Next 16 `params` promise pitfall avoided).
- **Type consistency:** `SegmentContent` field names in `content.ts` (Task 1) match consumption in `SegmentLanding.renderSection` (Task 5) and all configs (Tasks 6–10): `painPoints.{heading,items}`, `outcomes.{heading,sub,items}`, `whyBest.{heading,items}`, `audience.{heading,items}`, `feedback.{heading,sub,items}`, `cta1/cta2.{headlineLead,headlineAccent,headlineTrail,sub}`, `faq.{heading,items}`, `hero`, `meta`, `sectionOrder`, `key`.
- **No test framework:** verification is build/lint/visual throughout, per Global Constraints — intentional, not a placeholder.
- **Copy expansion:** configs show representative Bangla + explicit "reuse flagship items from line range" pointers; the implementer copies exact flagship objects rather than inventing — not a placeholder, a sourcing instruction.
```
