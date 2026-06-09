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
    <div onMouseMove={tilt.onMouseMove} onMouseLeave={tilt.onMouseLeave} style={{ transition: 'transform 0.2s ease-out', background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(34,211,238,0.03))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 18, padding: 28, backdropFilter: 'blur(10px)', height: '100%' }}>
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
