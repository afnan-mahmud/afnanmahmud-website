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
