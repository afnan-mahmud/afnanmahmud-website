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
    <div onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={{ transition: 'transform 0.2s ease-out', background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', border: `1px solid ${p.color}30`, borderRadius: 20, padding: 30, height: '100%', position: 'relative', overflow: 'hidden' }}>
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
