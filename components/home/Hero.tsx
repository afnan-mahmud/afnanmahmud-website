// components/home/Hero.tsx
'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';

function GithubIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}
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
            I build &amp; ship{' '}
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
              <GithubIcon size={22} />
            </a>
          </motion.div>
        </div>

        {/* Right: 3D scene with photo overlay */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ position: 'relative', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hero-3d">
          <div style={{ position: 'absolute', inset: 0 }}>
            <Scene />
          </div>
          {/* Photo card overlaps the scene center */}
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
