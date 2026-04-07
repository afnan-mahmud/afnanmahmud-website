'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export default function CtaBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      style={{
        background: '#0a0a0a',
        padding: '80px 24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: 'clamp(40px, 6vw, 72px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 120%, rgba(99,102,241,0.15) 0%, transparent 60%)',
        }} />

        {/* Top sparkle badge */}
        <div
          className={sg.className}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '100px',
            color: '#a5b4fc',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Sparkles size={12} />
          Limited Time Offer
        </div>

        <h2
          className={sg.className}
          style={{
            fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            marginBottom: '16px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Ready to{' '}
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            level up
          </span>
          {' '}your skills?
        </h2>

        <p
          className={inter.className}
          style={{
            color: '#71717a',
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            lineHeight: 1.7,
            maxWidth: '520px',
            margin: '0 auto 36px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Join hundreds of students already learning with Afnan. Start today and get lifetime access to all course materials.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '14px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Link
            href="/auth/otp"
            className={sg.className}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(99,102,241,0.35)',
              transition: 'box-shadow 0.2s, transform 0.2s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 60px rgba(99,102,241,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'none'; }}
          >
            Start Learning Today
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/courses"
            className={sg.className}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              color: '#a1a1aa',
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#a5b4fc'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
          >
            Browse Courses
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
