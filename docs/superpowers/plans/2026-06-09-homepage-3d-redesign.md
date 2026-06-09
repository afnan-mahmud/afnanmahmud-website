# Homepage 3D Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public homepage into a modern, professional senior-engineer + course-instructor landing page with a real WebGL 3D interactive hero and honest, DB-backed stats.

**Architecture:** `app/(public)/page.tsx` stays a server component that fetches real data (featured course thumbnail, live student count, published course count) and composes nine client section components from `components/home/`. The hero's 3D scene is an R3F client component loaded via `next/dynamic({ ssr: false })` with a static fallback, so SSR stays safe and there is no layout shift.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, framer-motion, Tailwind v4, `@react-three/fiber@9`, `three@0.184`, `@react-three/drei@10`. No test framework exists — verification is `npm run build` + dev-server visual checks.

**Verification note:** This repo has no unit test runner. Each task is verified by (a) `npm run build` passing and (b) loading `http://localhost:3000/` in the dev server and visually confirming the section. Commit after each task.

---

## File Structure

- **Modify** `app/(public)/page.tsx` — server component: data fetch + section composition.
- **Modify** `package.json` — add three / R3F / drei deps.
- **Create** `lib/home-data.ts` — typed profile constants (companies, tech stack, projects) so content is DRY and editable in one place.
- **Rewrite** `components/home/Hero.tsx` — hero layout + CTAs + stats; mounts the 3D scene via dynamic import with fallback.
- **Create** `components/home/hero3d/Scene.tsx` — the R3F Canvas + Interactive Tech Orbit scene (client, ssr:false consumer).
- **Create** `components/home/hero3d/TechOrbit.tsx` — orbiting tech badges + distorted core mesh (used by Scene).
- **Create** `components/home/TrustedBy.tsx` — animated company marquee.
- **Create** `components/home/Experience.tsx` — bio + experience timeline (3D-tilt cards).
- **Create** `components/home/TechStack.tsx` — bento grid of stack categories.
- **Create** `components/home/FeaturedProjects.tsx` — 3D-tilt project cards.
- **Create** `components/home/useTilt.ts` — shared pointer-driven 3D tilt hook (DRY for cards).
- **Modify** `components/home/FeaturedCourse.tsx` — restyle to match (keep `thumbnail` prop, accept new `studentCount`).
- **Modify** `components/home/WhyAfnan.tsx` — restyle only (content unchanged).
- **Modify** `components/home/Testimonials.tsx` — restyle only.
- **Rewrite** `components/home/CtaBanner.tsx` — split "Learn with me" / "Hire me" dual CTA.

---

## Task 1: Install 3D dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install pinned, React-19-compatible versions**

Run:
```bash
npm install three@0.184.0 @react-three/fiber@9.6.1 @react-three/drei@10.7.7 && npm install -D @types/three@0.184.0
```

- [ ] **Step 2: Verify install + types resolve**

Run: `npm ls three @react-three/fiber @react-three/drei`
Expected: all three listed at the pinned versions, no `UNMET PEER DEPENDENCY` for react.

- [ ] **Step 3: Verify build still passes (no usage yet)**

Run: `npm run build`
Expected: build completes with exit code 0.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Add three.js / react-three-fiber / drei for 3D hero"
```

---

## Task 2: Home data constants

**Files:**
- Create: `lib/home-data.ts`

- [ ] **Step 1: Create the typed content module**

```ts
// lib/home-data.ts
// Single source of truth for homepage profile content. Edit here, not in components.

export const PROFILE = {
  name: 'Afnan Mahmud',
  title: 'Senior Full-Stack Engineer',
  yearsExperience: 5, // "5+ years"
  github: 'https://github.com/afnan-mahmud',
  tagline:
    'I build production web & mobile products — and teach you to do the same, in Bangla.',
} as const;

export const COMPANIES: { name: string }[] = [
  { name: 'Grameenphone' },
  { name: 'Cholo Bohudur' },
  { name: 'Thaka Jabe' },
  { name: 'Gowaay' },
];

export type TechCategory = {
  key: string;
  label: string;
  items: string[];
  color: string;
};

export const TECH_STACK: TechCategory[] = [
  { key: 'frontend', label: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind'], color: '#61dafb' },
  { key: 'backend', label: 'Backend', items: ['Node.js', 'Express', 'NestJS', 'Python'], color: '#68d391' },
  { key: 'database', label: 'Database', items: ['MongoDB', 'PostgreSQL'], color: '#4ade80' },
  { key: 'devops', label: 'DevOps', items: ['Docker', 'AWS', 'VPS'], color: '#fbbf24' },
  { key: 'mobile', label: 'Mobile', items: ['React Native', 'Flutter'], color: '#a78bfa' },
];

export type Project = {
  name: string;
  description: string;
  stack: string[];
  color: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'Grameenphone',
    description: 'Contributed to large-scale customer-facing web features for the leading telecom operator in Bangladesh.',
    stack: ['React', 'Next.js', 'Node.js'],
    color: '#6366f1',
  },
  {
    name: 'Cholo Bohudur',
    description: 'Founder & lead engineer of the agency — delivering full-stack web & mobile products for clients.',
    stack: ['Next.js', 'NestJS', 'PostgreSQL'],
    color: '#22d3ee',
  },
  {
    name: 'Thaka Jabe',
    description: 'Built and shipped the platform end-to-end, from API design to a polished responsive frontend.',
    stack: ['React', 'Node.js', 'MongoDB'],
    color: '#a78bfa',
  },
  {
    name: 'Gowaay',
    description: 'Engineered core product features with a focus on performance and clean, maintainable architecture.',
    stack: ['React Native', 'Express', 'MongoDB'],
    color: '#4ade80',
  },
];

// The 3D orbit badges (kept short for performance).
export const ORBIT_TECH: { label: string; color: string }[] = [
  { label: 'React', color: '#61dafb' },
  { label: 'Node', color: '#68d391' },
  { label: 'Mongo', color: '#4ade80' },
  { label: 'Next', color: '#ffffff' },
  { label: 'Docker', color: '#38bdf8' },
  { label: 'TS', color: '#3178c6' },
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors referencing `lib/home-data.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/home-data.ts
git commit -m "Add homepage profile/content constants"
```

---

## Task 3: Shared 3D tilt hook

**Files:**
- Create: `components/home/useTilt.ts`

- [ ] **Step 1: Create the pointer-driven tilt hook**

```ts
// components/home/useTilt.ts
'use client';

import { useRef, useCallback } from 'react';

/**
 * Returns a ref + handlers that apply a subtle 3D tilt toward the cursor.
 * Respects prefers-reduced-motion (no-op when reduced).
 */
export function useTilt(maxDeg = 8) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${px * maxDeg}deg) rotateX(${-py * maxDeg}deg)`;
    },
    [maxDeg]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  }, []);

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/useTilt.ts
git commit -m "Add shared 3D tilt hook for cards"
```

---

## Task 4: 3D Tech Orbit mesh

**Files:**
- Create: `components/home/hero3d/TechOrbit.tsx`

- [ ] **Step 1: Create the orbiting badges + distorted core**

```tsx
// components/home/hero3d/TechOrbit.tsx
'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Icosahedron, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { ORBIT_TECH } from '@/lib/home-data';

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <Icosahedron ref={ref} args={[1.25, 4]}>
      <MeshDistortMaterial
        color="#6366f1"
        emissive="#22d3ee"
        emissiveIntensity={0.25}
        roughness={0.15}
        metalness={0.6}
        distort={0.35}
        speed={1.5}
      />
    </Icosahedron>
  );
}

export default function TechOrbit() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.25;
  });

  const radius = 2.6;
  return (
    <group>
      <Core />
      <group ref={group}>
        {ORBIT_TECH.map((t, i) => {
          const angle = (i / ORBIT_TECH.length) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const y = Math.sin(angle * 2) * 0.6;
          return (
            <Float key={t.label} speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
              <Html position={[x, y, z]} center distanceFactor={8} zIndexRange={[10, 0]}>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: 100,
                    background: 'rgba(10,10,10,0.7)',
                    border: `1px solid ${t.color}55`,
                    color: t.color,
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    backdropFilter: 'blur(6px)',
                    pointerEvents: 'none',
                  }}
                >
                  {t.label}
                </div>
              </Html>
            </Float>
          );
        })}
      </group>
    </group>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors. (TechOrbit is not yet imported anywhere — that is fine.)

- [ ] **Step 3: Commit**

```bash
git add components/home/hero3d/TechOrbit.tsx
git commit -m "Add 3D tech orbit mesh (R3F)"
```

---

## Task 5: 3D Scene canvas

**Files:**
- Create: `components/home/hero3d/Scene.tsx`

- [ ] **Step 1: Create the Canvas wrapper with mouse parallax + lighting**

```tsx
// components/home/hero3d/Scene.tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Suspense } from 'react';
import TechOrbit from './TechOrbit';

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#6366f1" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#22d3ee" />
      <Suspense fallback={null}>
        <TechOrbit />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/hero3d/Scene.tsx
git commit -m "Add R3F canvas scene for hero"
```

---

## Task 6: Rewrite Hero with dynamic 3D + dual CTA + stats

**Files:**
- Rewrite: `components/home/Hero.tsx`

- [ ] **Step 1: Rewrite Hero**

Hero accepts `studentCount: number` and `projectCount: number` props. It renders the headline, dual CTAs (`Explore Courses` → `/courses`, `Work With Me` → `/contact`), an honest stat row, and the 3D scene loaded via `next/dynamic({ ssr: false })` with a CSS-gradient + photo fallback. Reuse the existing background orbs/grid styling for consistency.

```tsx
// components/home/Hero.tsx
'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Github } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { PROFILE } from '@/lib/home-data';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const Scene = dynamic(() => import('./hero3d/Scene'), {
  ssr: false,
  loading: () => null,
});

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' as const },
  }),
};

export default function Hero({
  studentCount,
  projectCount,
}: {
  studentCount: number;
  projectCount: number;
}) {
  const stats = [
    { value: `${PROFILE.yearsExperience}+`, label: 'Years experience' },
    { value: `${projectCount}+`, label: 'Projects shipped' },
    ...(studentCount > 0
      ? [{ value: `${studentCount}+`, label: 'Students' }]
      : [{ value: 'Now', label: 'Enrolling' }]),
  ];

  return (
    <section
      id="hero"
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '64px',
      }}
    >
      {/* Background orbs */}
      <div aria-hidden style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div
        className="hero-grid"
        style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}
      >
        {/* Left: text */}
        <div>
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" style={{ marginBottom: 24 }}>
            <span className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, color: '#a5b4fc', fontSize: '0.8125rem', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />
              {PROFILE.title} &middot; Educator
            </span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className={sg.className} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 20px', color: '#f1f5f9' }}>
            I build & ship{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              real products
            </span>
            <br />— and teach you how.
          </motion.h1>

          <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className={inter.className} style={{ fontSize: 'clamp(1rem, 2vw, 1.1875rem)', color: '#a1a1aa', lineHeight: 1.7, margin: '0 0 36px', maxWidth: 520 }}>
            {PROFILE.tagline}
          </motion.p>

          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 44 }}>
            <Link href="/courses" className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none', boxShadow: '0 0 30px rgba(99,102,241,0.35)' }}>
              Explore Courses <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, color: '#e2e8f0', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' }}>
              <Briefcase size={16} /> Work With Me
            </Link>
          </motion.div>

          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.5rem' }}>{s.value}</span>
                <span className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem' }}>{s.label}</span>
              </div>
            ))}
            <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ color: '#a1a1aa', display: 'inline-flex' }}>
              <Github size={22} />
            </a>
          </motion.div>
        </div>

        {/* Right: 3D scene with photo fallback */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ position: 'relative', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hero-3d">
          <div style={{ position: 'absolute', inset: 0 }}>
            <Scene />
          </div>
          {/* Photo card overlaps the scene */}
          <div style={{ position: 'relative', width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(99,102,241,0.4)', boxShadow: '0 0 50px rgba(99,102,241,0.35)', zIndex: 2, pointerEvents: 'none' }}>
            <img src="/mentor.jpeg" alt={PROFILE.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 32px !important; text-align: center; }
          .hero-grid > div:last-child { order: -1; height: 320px !important; }
        }
      `}</style>
    </section>
  );
}
```

- [ ] **Step 2: Wire stats props in the page (temporary inline) so build passes**

This step only checks Hero compiles in isolation. Update `app/(public)/page.tsx` to pass placeholder props (real values come in Task 11):

In `app/(public)/page.tsx`, change `<Hero />` to `<Hero studentCount={0} projectCount={4} />`.

- [ ] **Step 3: Build + visual check**

Run: `npm run build` → expected exit 0.
Then `npm run dev`, open `http://localhost:3000/`, confirm: 3D orbit renders on the right, badges float, mouse-over page does not crash, photo circle centered, dual CTAs visible. (If dev shows stale output, follow CLAUDE.md: `pkill -f "next dev"; rm -rf .next/dev .next/cache; npm run dev`.)

- [ ] **Step 4: Commit**

```bash
git add components/home/Hero.tsx app/\(public\)/page.tsx
git commit -m "Rewrite Hero with R3F 3D orbit, dual CTA, honest stats"
```

---

## Task 7: TrustedBy company marquee

**Files:**
- Create: `components/home/TrustedBy.tsx`

- [ ] **Step 1: Create the marquee**

```tsx
// components/home/TrustedBy.tsx
'use client';

import { Space_Grotesk } from 'next/font/google';
import { COMPANIES } from '@/lib/home-data';

const sg = Space_Grotesk({ subsets: ['latin'] });

export default function TrustedBy() {
  const row = [...COMPANIES, ...COMPANIES, ...COMPANIES];
  return (
    <section style={{ background: '#0a0a0a', padding: '48px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <p className={sg.className} style={{ textAlign: 'center', color: '#52525b', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 28 }}>
        Building products for & with
      </p>
      <div style={{ display: 'flex', overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent)' }}>
        <div style={{ display: 'flex', gap: 64, animation: 'marqueeMove 24s linear infinite', whiteSpace: 'nowrap' }}>
          {row.map((c, i) => (
            <span key={i} className={sg.className} style={{ color: '#71717a', fontSize: '1.5rem', fontWeight: 700, opacity: 0.7 }}>
              {c.name}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes marqueeMove { from { transform: translateX(0); } to { transform: translateX(-33.33%); } }`}</style>
    </section>
  );
}
```

- [ ] **Step 2: Build + commit**

Run: `npm run build` → exit 0.
```bash
git add components/home/TrustedBy.tsx
git commit -m "Add TrustedBy company marquee"
```

---

## Task 8: Experience section

**Files:**
- Create: `components/home/Experience.tsx`

- [ ] **Step 1: Create bio + experience cards (tilt)**

```tsx
// components/home/Experience.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Building2, Code2, Globe } from 'lucide-react';
import { PROFILE } from '@/lib/home-data';
import { useTilt } from './useTilt';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const ITEMS = [
  { icon: Building2, title: 'Agency Owner — Cholo Bohudur', desc: 'Founded and lead a development agency delivering full-stack web & mobile products for clients.' },
  { icon: Code2, title: 'Senior Full-Stack Engineer', desc: 'Shipped customer-facing features for companies like Grameenphone, Thaka Jabe and Gowaay across the stack.' },
  { icon: Globe, title: 'International Freelance', desc: 'Work with clients on the global market, owning projects from architecture to deployment.' },
];

function Card({ icon: Icon, title, desc }: { icon: typeof Building2; title: string; desc: string }) {
  const tilt = useTilt(6);
  return (
    <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={{ transition: 'transform 0.2s ease-out', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.03))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 18, padding: 28, backdropFilter: 'blur(10px)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon size={22} color="#a5b4fc" />
      </div>
      <h3 className={sg.className} style={{ color: '#f1f5f9', fontSize: '1.0625rem', fontWeight: 700, margin: '0 0 10px' }}>{title}</h3>
      <p className={inter.className} style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section ref={ref} style={{ background: '#0d0d0d', padding: '110px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ marginBottom: 56, maxWidth: 640 }}>
          <h2 className={sg.className} style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 18px' }}>
            {PROFILE.yearsExperience}+ years building software{' '}
            <span style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>that ships</span>
          </h2>
          <p className={inter.className} style={{ color: '#94a3b8', fontSize: '1.0625rem', lineHeight: 1.75, margin: 0 }}>
            From telecom-scale features to founding my own agency, I&apos;ve spent the last half-decade turning ideas into production products — and now I teach the exact skills I use every day.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {ITEMS.map((it, i) => (
            <motion.div key={it.title} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.15 + i * 0.1 }}>
              <Card {...it} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build + commit**

Run: `npm run build` → exit 0.
```bash
git add components/home/Experience.tsx
git commit -m "Add Experience section with tilt cards"
```

---

## Task 9: TechStack bento grid

**Files:**
- Create: `components/home/TechStack.tsx`

- [ ] **Step 1: Create the bento grid**

```tsx
// components/home/TechStack.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { TECH_STACK } from '@/lib/home-data';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export default function TechStack() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section ref={ref} style={{ background: '#0a0a0a', padding: '110px 0', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className={sg.className} style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            My tech <span style={{ background: 'linear-gradient(90deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>stack</span>
          </h2>
          <p className={inter.className} style={{ color: '#94a3b8', fontSize: '1.0625rem', maxWidth: 520, margin: '0 auto' }}>
            The tools I use to design, build, and ship full-stack products end-to-end.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {TECH_STACK.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              whileHover={{ y: -6 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${cat.color}30`, borderRadius: 18, padding: 26, position: 'relative', overflow: 'hidden' }}
            >
              <div aria-hidden style={{ position: 'absolute', top: -30, right: -30, width: 110, height: 110, borderRadius: '50%', background: `radial-gradient(circle, ${cat.color}22 0%, transparent 70%)` }} />
              <h3 className={sg.className} style={{ color: cat.color, fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px' }}>{cat.label}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cat.items.map((it) => (
                  <span key={it} className={inter.className} style={{ padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: '0.8125rem', fontWeight: 500 }}>{it}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build + commit**

Run: `npm run build` → exit 0.
```bash
git add components/home/TechStack.tsx
git commit -m "Add TechStack bento grid"
```

---

## Task 10: FeaturedProjects tilt cards

**Files:**
- Create: `components/home/FeaturedProjects.tsx`

- [ ] **Step 1: Create the project cards**

```tsx
// components/home/FeaturedProjects.tsx
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { PROJECTS } from '@/lib/home-data';
import { useTilt } from './useTilt';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

function ProjectCard({ p }: { p: (typeof PROJECTS)[number] }) {
  const tilt = useTilt(7);
  return (
    <div ref={tilt.ref} onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={{ transition: 'transform 0.2s ease-out', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: `1px solid ${p.color}30`, borderRadius: 20, padding: 30, height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(circle, ${p.color}1f 0%, transparent 70%)` }} />
      <h3 className={sg.className} style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 12px' }}>{p.name}</h3>
      <p className={inter.className} style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: '0 0 18px' }}>{p.description}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {p.stack.map((s) => (
          <span key={s} className={inter.className} style={{ padding: '4px 10px', borderRadius: 6, background: `${p.color}14`, border: `1px solid ${p.color}33`, color: p.color, fontSize: '0.75rem', fontWeight: 600 }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section ref={ref} style={{ background: '#0d0d0d', padding: '110px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <motion.div initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 className={sg.className} style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Selected <span style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>work</span>
          </h2>
          <p className={inter.className} style={{ color: '#94a3b8', fontSize: '1.0625rem', maxWidth: 520, margin: '0 auto' }}>
            Products I&apos;ve engineered and shipped across web and mobile.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 24 }}>
          {PROJECTS.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.12 + i * 0.1 }}>
              <ProjectCard p={p} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build + commit**

Run: `npm run build` → exit 0.
```bash
git add components/home/FeaturedProjects.tsx
git commit -m "Add FeaturedProjects tilt cards"
```

---

## Task 11: Rewrite DualCTA (CtaBanner)

**Files:**
- Rewrite: `components/home/CtaBanner.tsx`

- [ ] **Step 1: Rewrite as split CTA**

```tsx
// components/home/CtaBanner.tsx
'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const PANELS = [
  { icon: GraduationCap, title: 'Learn with me', desc: 'Job-ready full-stack skills, explained in Bangla with real projects.', cta: 'Explore Courses', href: '/courses', accent: '#6366f1' },
  { icon: Briefcase, title: 'Hire me', desc: 'Need a web or mobile product built right? Let&apos;s talk about your project.', cta: 'Work With Me', href: '/contact', accent: '#22d3ee' },
];

export default function CtaBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section ref={ref} style={{ background: '#0a0a0a', padding: '110px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {PANELS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.12 }}
            style={{ background: `linear-gradient(135deg, ${p.accent}1a, ${p.accent}05)`, border: `1px solid ${p.accent}40`, borderRadius: 24, padding: 44, position: 'relative', overflow: 'hidden' }}
          >
            <div aria-hidden style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle, ${p.accent}26 0%, transparent 70%)` }} />
            <div style={{ width: 54, height: 54, borderRadius: 14, background: `${p.accent}1f`, border: `1px solid ${p.accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
              <p.icon size={26} color={p.accent} />
            </div>
            <h3 className={sg.className} style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 12px' }}>{p.title}</h3>
            <p className={inter.className} style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: '0 0 26px' }} dangerouslySetInnerHTML={{ __html: p.desc }} />
            <Link href={p.href} className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: p.accent, borderRadius: 10, color: '#0a0a0a', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none' }}>
              {p.cta} <ArrowRight size={16} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build + commit**

Run: `npm run build` → exit 0.
```bash
git add components/home/CtaBanner.tsx
git commit -m "Rewrite CtaBanner as dual learn/hire CTA"
```

---

## Task 12: Wire up the page with real data + final composition

**Files:**
- Modify: `app/(public)/page.tsx`
- Modify: `components/home/FeaturedCourse.tsx` (accept `studentCount` prop; restyle header if needed)

- [ ] **Step 1: Rewrite the page to fetch real data and compose all sections**

```tsx
// app/(public)/page.tsx
import Hero from '@/components/home/Hero';
import TrustedBy from '@/components/home/TrustedBy';
import Experience from '@/components/home/Experience';
import TechStack from '@/components/home/TechStack';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import FeaturedCourse from '@/components/home/FeaturedCourse';
import WhyAfnan from '@/components/home/WhyAfnan';
import Testimonials from '@/components/home/Testimonials';
import CtaBanner from '@/components/home/CtaBanner';
import { PROJECTS } from '@/lib/home-data';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';

export const metadata = {
  title: 'Afnan Mahmud — Senior Full-Stack Engineer & MERN Educator',
  description:
    'Senior Full-Stack Engineer (5+ years). I build production web & mobile products and teach MERN + mobile development in Bangla. Explore courses or hire me.',
  openGraph: {
    title: 'Afnan Mahmud — Senior Full-Stack Engineer & MERN Educator',
    description: 'Build real products and learn full-stack development in Bangla with Afnan Mahmud.',
    type: 'website',
  },
};

export default async function HomePage() {
  await connectDB();

  const featured = await Course.findOne({ slug: 'ai-for-developers' })
    .select('thumbnail enrolledCount')
    .lean<{ thumbnail?: string; enrolledCount?: number }>();

  const agg = await Course.aggregate<{ total: number }>([
    { $match: { isPublished: true } },
    { $group: { _id: null, total: { $sum: '$enrolledCount' } } },
  ]);
  const studentCount = agg[0]?.total ?? 0;

  return (
    <>
      <Hero studentCount={studentCount} projectCount={PROJECTS.length} />
      <TrustedBy />
      <Experience />
      <TechStack />
      <FeaturedProjects />
      <FeaturedCourse thumbnail={featured?.thumbnail} studentCount={featured?.enrolledCount ?? 0} />
      <WhyAfnan />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
```

- [ ] **Step 2: Make FeaturedCourse accept the new `studentCount` prop**

Open `components/home/FeaturedCourse.tsx`. Update its props type to include the optional `studentCount`. Find the existing props declaration (it currently takes `{ thumbnail }`). Change it to:

```tsx
export default function FeaturedCourse({ thumbnail, studentCount = 0 }: { thumbnail?: string; studentCount?: number }) {
```

If the component currently displays a hardcoded enrolled/student number, replace that literal with `{studentCount > 0 ? `${studentCount}+ enrolled` : 'Be the first to enroll'}`. If it shows no such number, leave the body unchanged — the prop is simply accepted (prevents the type error from Step 1's call site). Do NOT introduce any fabricated count.

- [ ] **Step 3: Build + full visual check**

Run: `npm run build` → expected exit 0.
Then `npm run dev` and open `http://localhost:3000/`. Confirm in order: Hero (3D orbit + real stats), TrustedBy marquee scrolling, Experience cards tilt on hover, TechStack bento, FeaturedProjects tilt cards, FeaturedCourse, WhyAfnan, Testimonials, dual CTA with working `/courses` and `/contact` links. Check mobile width (DevTools responsive) — hero stacks, 3D shrinks. Check console: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(public\)/page.tsx components/home/FeaturedCourse.tsx
git commit -m "Wire homepage sections with real DB-backed stats"
```

---

## Task 13: Restyle WhyAfnan + Testimonials for consistency (optional polish)

**Files:**
- Modify: `components/home/WhyAfnan.tsx`
- Modify: `components/home/Testimonials.tsx`

- [ ] **Step 1: Visual audit**

With dev server running, compare WhyAfnan and Testimonials against the new sections. They already use the same dark theme, Space Grotesk/Inter, and gradient accents, so only adjust if there is a visible mismatch (e.g. section background `#0d0d0d` vs `#0a0a0a` alternation, padding). Keep all copy unchanged.

- [ ] **Step 2: Apply minimal adjustments only if needed, then build + commit**

Run: `npm run build` → exit 0.
```bash
git add components/home/WhyAfnan.tsx components/home/Testimonials.tsx
git commit -m "Polish WhyAfnan + Testimonials to match redesign"
```
(If no changes were needed, skip the commit.)

---

## Task 14: Final verification

- [ ] **Step 1: Production build**

Run: `npm run build`
Expected: exit 0, no type errors, all routes compiled.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors introduced by the new files.

- [ ] **Step 3: Reduced-motion + mobile sanity**

In DevTools, emulate `prefers-reduced-motion: reduce` → tilt hooks no-op (cards do not rotate). Resize to 375px → hero stacks, 3D scene 320px tall, marquee still scrolls, no horizontal overflow.

- [ ] **Step 4: Confirm no fabricated metrics**

Grep for stray hardcoded counts: `grep -rn "500+\|10+\|200+" components/home/`. Expected: only legitimate matches (e.g. WhyAfnan community copy if intentionally kept). Remove any invented student/course numbers in the hero/featured area.

---

## Self-Review notes

- **Spec coverage:** Hero3D (T4–T6), TrustedBy (T7), Experience (T8), TechStack (T9), FeaturedProjects (T10), FeaturedCourse (T12), WhyAfnan/Testimonials (T13), DualCTA (T11), real data flow (T12), 3D deps + SSR-safe dynamic import (T1, T6), honest stats (T6, T12, T14 step 4). All spec sections mapped.
- **Type consistency:** `Hero` props `{ studentCount, projectCount }` defined in T6 and supplied in T12. `FeaturedCourse` gains `studentCount?` in T12 matching the T12 call site. `useTilt` returns `{ ref, onMouseMove, onMouseLeave }` consumed identically in T8 + T10. `home-data.ts` exports (`PROFILE`, `COMPANIES`, `TECH_STACK`, `PROJECTS`, `ORBIT_TECH`) consumed with matching names.
- **No placeholders:** every code step contains full code.
