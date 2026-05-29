'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Zap, Tag } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const BULLETS = [
  'Build custom websites & mobile apps using AI',
  'Master AntiGravity, Gemini & Claude Code — all free tools',
  'Production-grade architecture & system design',
  'Backend, database & business logic with AI',
  'Deploy a real production SaaS to live servers',
  'Portfolio + job-ready as a Software Engineer',
];

export default function FeaturedCourse({ thumbnail }: { thumbnail?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      id="courses"
      ref={ref}
      style={{
        background: '#0a0a0a',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle accent glow */}
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 300, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
        }}
        className="feat-grid"
      >
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span
            className={sg.className}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              background: 'rgba(34,211,238,0.1)',
              border: '1px solid rgba(34,211,238,0.25)',
              borderRadius: '100px',
              color: '#22d3ee',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <Zap size={12} />
            Featured Course
          </span>

          <h2
            className={sg.className}
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              marginBottom: '28px',
            }}
          >
            Custom Web & Mobile Apps{' '}
            <span style={{ color: '#6366f1' }}>with</span>{' '}
            AI
          </h2>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {BULLETS.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.07 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                className={inter.className}
              >
                <CheckCircle size={18} color="#6366f1" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ color: '#a1a1aa', fontSize: '0.9375rem', lineHeight: 1.5 }}>{item}</span>
              </motion.li>
            ))}
          </ul>

          <Link
            href="/ai-for-developers"
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
              boxShadow: '0 0 24px rgba(99,102,241,0.3)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'none'; }}
          >
            See Course Details
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Right: Course card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
            }}
          >
            {/* Thumbnail */}
            <div
              style={{
                height: 200,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(34,211,238,0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="AI for Developers"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <>
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                      backgroundSize: '30px 30px',
                    }}
                  />
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        fontSize: '3.5rem',
                        marginBottom: '8px',
                        filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.5))',
                      }}
                    >
                      🤖
                    </div>
                    <span className={sg.className} style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      AI Dev Masterclass
                    </span>
                  </div>
                </>
              )}

              {/* Price badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  background: 'rgba(99,102,241,0.9)',
                  borderRadius: '100px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  fontFamily: sg.style.fontFamily,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Tag size={12} />
                ৳990
              </div>
            </div>

            {/* Card body */}
            <div style={{ padding: '24px' }}>
              <h3
                className={sg.className}
                style={{
                  color: '#f1f5f9',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  marginBottom: '8px',
                  letterSpacing: '-0.01em',
                }}
              >
                AI for Developers
              </h3>
              <p
                className={inter.className}
                style={{ color: '#71717a', fontSize: '0.875rem', marginBottom: '20px', lineHeight: 1.6 }}
              >
                Build production-grade websites & mobile apps from zero using free AI tools. Bangla content.
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['AntiGravity', 'Gemini', 'Claude Code', 'Cursor'].map((tag) => (
                  <span
                    key={tag}
                    className={sg.className}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: '6px',
                      color: '#a5b4fc',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .feat-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
