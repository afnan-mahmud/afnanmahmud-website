'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Code2, Smartphone, Server, ArrowRight, CalendarDays, Rocket, Building2, Layers } from 'lucide-react';
import { PROFILE, PROJECTS, COMPANIES } from '@/lib/home-data';
import TechStack from '@/components/home/TechStack';
import CtaBanner from '@/components/home/CtaBanner';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const AboutScene = dynamic(() => import('@/components/about/about3d/AboutScene'), {
  ssr: false,
  loading: () => null,
});

const STATS = [
  { icon: CalendarDays, value: `${PROFILE.yearsExperience}+`, label: 'Years building software' },
  { icon: Rocket, value: `${PROJECTS.length}`, label: 'Flagship projects shipped' },
  { icon: Building2, value: `${COMPANIES.length}`, label: 'Companies & clients' },
  { icon: Layers, value: 'Web + Mobile', label: 'Full-stack delivery' },
];

const SERVICES = [
  {
    icon: Code2,
    title: 'Web Development',
    description: 'Production full-stack web apps — from marketing sites to complex SaaS platforms, built on React/Next and Node.',
    color: '#6366f1',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Cross-platform iOS & Android apps with React Native and Flutter. Clean UI, native-feel performance.',
    color: '#22d3ee',
  },
  {
    icon: Server,
    title: 'Backend & APIs',
    description: 'Scalable REST APIs, authentication, database design (MongoDB/PostgreSQL), and deployment on Docker/AWS/VPS.',
    color: '#a78bfa',
  },
];

const JOURNEY = [
  {
    title: 'Engineering at scale',
    desc: 'Built customer-facing features for Grameenphone — the largest telecom operator in Bangladesh — where reliability and scale are non-negotiable.',
  },
  {
    title: 'Founded Cholo Bohudur',
    desc: 'Started my own development agency, leading a team to deliver full-stack web and mobile products for clients end-to-end.',
  },
  {
    title: 'Shipping for clients worldwide',
    desc: 'Worked on products like Thaka Jabe and Gowaay, and continue to take on international freelance projects across the stack.',
  },
  {
    title: 'Teaching what I do daily',
    desc: 'Now I teach the exact, real-world skills I use every day — hands-on, project-based, and explained in Bangla for maximum clarity.',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

export default function AboutPage() {
  const statsRef = useRef(null);
  const journeyRef = useRef(null);
  const servicesRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });
  const journeyInView = useInView(journeyRef, { once: true, margin: '-80px' });
  const servicesInView = useInView(servicesRef, { once: true, margin: '-80px' });

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '64px' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '90px 0 80px' }}>
        <div aria-hidden style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }} className="about-grid">

            {/* Left: bio */}
            <div>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                  About Me
                </span>
              </motion.div>

              <motion.h1 className={sg.className} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 20px' }}>
                Hi, I&apos;m{' '}
                <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {PROFILE.name}
                </span>
              </motion.h1>

              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <p className={inter.className} style={{ color: '#94a3b8', fontSize: '1.0625rem', lineHeight: 1.8, marginBottom: 18 }}>
                  I&apos;m a <strong style={{ color: '#e2e8f0' }}>{PROFILE.title}</strong> with {PROFILE.yearsExperience}+ years of experience — founder of the agency <strong style={{ color: '#e2e8f0' }}>Cholo Bohudur</strong>, and an international freelancer building production web &amp; mobile products.
                </p>
                <p className={inter.className} style={{ color: '#71717a', fontSize: '1rem', lineHeight: 1.8, marginBottom: 32 }}>
                  I believe the best way to learn programming is by building real projects — not watching endless theory videos. So I teach the exact stack I ship with every day, hands-on and in Bangla for maximum clarity.
                </p>

                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <Link href="/courses" className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}>
                    View Courses <ArrowRight size={15} />
                  </Link>
                  <Link href="/contact" className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e2e8f0', fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none' }}>
                    Work With Me
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right: 3D scene + photo */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ position: 'relative', height: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="about-3d">
              <div style={{ position: 'absolute', inset: 0 }}>
                <AboutScene />
              </div>
              <div style={{ position: 'relative', width: 160, height: 160, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(99,102,241,0.4)', boxShadow: '0 0 50px rgba(99,102,241,0.35)', zIndex: 2, pointerEvents: 'none' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mentor.jpeg" alt={PROFILE.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats (honest) */}
      <section ref={statsRef} style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24 }}>
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <motion.div key={label} custom={i} variants={fadeUp} initial="hidden" animate={statsInView ? 'visible' : 'hidden'} style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Icon size={22} color="#6366f1" />
                </div>
                <div className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {value}
                </div>
                <div className={inter.className} style={{ color: '#71717a', fontSize: '0.875rem' }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* My Journey */}
      <section ref={journeyRef} style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={journeyInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', marginBottom: 16, background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: 100, color: '#22d3ee', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
              My Journey
            </span>
            <h2 className={sg.className} style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.025em', margin: 0 }}>
              From shipping products to teaching them
            </h2>
          </motion.div>

          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
            {/* timeline line */}
            <div aria-hidden style={{ position: 'absolute', left: 19, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, rgba(99,102,241,0.5), rgba(34,211,238,0.2), transparent)' }} />
            {JOURNEY.map((j, i) => (
              <motion.div key={j.title} custom={i} variants={fadeUp} initial="hidden" animate={journeyInView ? 'visible' : 'hidden'} style={{ display: 'flex', gap: 24, marginBottom: i === JOURNEY.length - 1 ? 0 : 36, position: 'relative' }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1.5px solid rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a5b4fc', fontWeight: 800, fontFamily: sg.style.fontFamily, zIndex: 1, backdropFilter: 'blur(4px)' }}>
                  {i + 1}
                </div>
                <div style={{ paddingTop: 4 }}>
                  <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.0625rem', margin: '0 0 8px' }}>{j.title}</h3>
                  <p className={inter.className} style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>{j.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack (reused from home) */}
      <TechStack />

      {/* Services */}
      <section ref={servicesRef} style={{ padding: '100px 0', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={servicesInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className={sg.className} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', marginBottom: 16, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 100, color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
              What I Build
            </span>
            <h2 className={sg.className} style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.025em', margin: 0 }}>
              Services &amp; Expertise
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {SERVICES.map(({ icon: Icon, title, description, color }, i) => (
              <motion.div key={title} custom={i} variants={fadeUp} initial="hidden" animate={servicesInView ? 'visible' : 'hidden'} whileHover={{ y: -5 }} style={{ background: `linear-gradient(135deg, ${color}10, ${color}04)`, border: `1px solid ${color}30`, borderRadius: 20, padding: 32, position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 64px rgba(0,0,0,0.4), 0 0 32px ${color}22`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div aria-hidden style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 20px ${color}20` }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.125rem', marginBottom: 12, letterSpacing: '-0.015em' }}>{title}</h3>
                <p className={inter.className} style={{ color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>{description}</p>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}60, transparent)`, borderRadius: '0 0 20px 20px' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA (reused from home) */}
      <CtaBanner />

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-grid > div:last-child { order: -1; height: 320px !important; }
        }
      `}</style>
    </div>
  );
}
