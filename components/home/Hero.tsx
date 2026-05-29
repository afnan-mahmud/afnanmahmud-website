'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Users, BookOpen, Clock } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const TECH_BADGES = [
  { label: 'React', color: '#61dafb', bg: 'rgba(97,218,251,0.12)', delay: 0 },
  { label: 'Node.js', color: '#68d391', bg: 'rgba(104,211,145,0.12)', delay: 0.6 },
  { label: 'MongoDB', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', delay: 1.2 },
  { label: 'React Native', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', delay: 1.8 },
];

const STATS = [
  { icon: Users, value: '500+', label: 'Students' },
  { icon: BookOpen, value: '10+', label: 'Courses' },
  { icon: Clock, value: '200+', label: 'Hours' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: 'easeOut' as const },
  }),
};

export default function Hero() {
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
      <div aria-hidden style={{
        position: 'absolute', top: '-10%', left: '-5%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: '40%', right: '25%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      {/* Subtle grid overlay */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
        className="hero-grid"
      >
        {/* Left: Text content */}
        <div>
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{ marginBottom: '24px' }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '100px',
                color: '#a5b4fc',
                fontSize: '0.8125rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
              className={sg.className}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
              Full Stack Developer &amp; Educator
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={sg.className}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 20px',
              color: '#f1f5f9',
            }}
          >
            Hi, I&apos;m{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Afnan Mahmud
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={inter.className}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
              color: '#a1a1aa',
              lineHeight: 1.7,
              margin: '0 0 36px',
              maxWidth: '500px',
            }}
          >
            MERN Stack &amp; Mobile App Developer. I teach real-world skills that get you hired.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '44px' }}
          >
            <a
              href="#courses"
              className={sg.className}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 28px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '10px',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                boxShadow: '0 0 30px rgba(99,102,241,0.35)',
                transition: 'box-shadow 0.2s, transform 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 50px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'none'; }}
            >
              Explore Courses
              <ArrowRight size={16} />
            </a>
            <Link
              href="/about"
              className={sg.className}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '13px 28px',
                background: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: '#e2e8f0',
                fontWeight: 600,
                fontSize: '0.9375rem',
                textDecoration: 'none',
                transition: 'border-color 0.2s, color 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = '#a5b4fc'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#e2e8f0'; }}
            >
              About Me
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}
          >
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} color="#6366f1" />
                <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem' }}>{value}</span>
                <span className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem' }}>{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: Photo + floating badges */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
        >
          {/* Photo container */}
          <div
            style={{
              position: 'relative',
              width: 340,
              height: 340,
              borderRadius: '28px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))',
              border: '1.5px solid rgba(99,102,241,0.35)',
              boxShadow: '0 0 60px rgba(99,102,241,0.25), 0 0 120px rgba(99,102,241,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Instructor photo */}
            <img
              src="/mentor.jpeg"
              alt="Afnan Mahmud"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Floating tech badges */}
          {TECH_BADGES.map(({ label, color, bg, delay }, i) => {
            const positions = [
              { top: '-16px', left: '10%' },
              { top: '20%', right: '-24px' },
              { bottom: '20%', right: '-28px' },
              { bottom: '-16px', left: '15%' },
            ];
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + delay * 0.15, duration: 0.4 }}
                style={{
                  position: 'absolute',
                  ...positions[i],
                  padding: '6px 14px',
                  background: bg,
                  border: `1px solid ${color}33`,
                  borderRadius: '100px',
                  color: color,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  backdropFilter: 'blur(8px)',
                  fontFamily: sg.style.fontFamily,
                  animation: `floatBadge${i} ${3 + i * 0.5}s ease-in-out infinite alternate`,
                }}
              >
                {label}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @keyframes floatBadge0 { from { transform: translateY(0px); } to { transform: translateY(-10px); } }
        @keyframes floatBadge1 { from { transform: translateY(0px); } to { transform: translateY(-8px); } }
        @keyframes floatBadge2 { from { transform: translateY(0px); } to { transform: translateY(8px); } }
        @keyframes floatBadge3 { from { transform: translateY(0px); } to { transform: translateY(-12px); } }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; text-align: center; }
          .hero-grid > div:last-child { order: -1; }
        }
      `}</style>
    </section>
  );
}
