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
  { icon: Briefcase, title: 'Hire me', desc: "Need a web or mobile product built right? Let's talk about your project.", cta: 'Work With Me', href: '/contact', accent: '#22d3ee' },
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
            <p className={inter.className} style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: '0 0 26px' }}>{p.desc}</p>
            <Link href={p.href} className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: p.accent, borderRadius: 10, color: '#0a0a0a', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none' }}>
              {p.cta} <ArrowRight size={16} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
