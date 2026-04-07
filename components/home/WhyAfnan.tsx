'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Hammer, Globe, Infinity, MessageCircle } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const CARDS = [
  {
    icon: Hammer,
    title: 'Real-World Projects',
    description: 'No boring theory dumps. Every concept is applied in a real project you can show to employers.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.25)',
    gradient: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.04))',
    border: 'rgba(99,102,241,0.35)',
  },
  {
    icon: Globe,
    title: 'Bangla Explanation',
    description: 'Complex topics broken down in Bangla so nothing gets lost in translation. Learn faster, retain more.',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.2)',
    gradient: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(34,211,238,0.03))',
    border: 'rgba(34,211,238,0.3)',
  },
  {
    icon: Infinity,
    title: 'Lifetime Access',
    description: 'Pay once, access forever. Learn at your own pace, revisit any lesson whenever you need a refresher.',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.22)',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.14), rgba(167,139,250,0.04))',
    border: 'rgba(167,139,250,0.35)',
  },
  {
    icon: MessageCircle,
    title: 'Community Support',
    description: 'Get help instantly via our WhatsApp & Discord groups. Active community of 500+ learners.',
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.2)',
    gradient: 'linear-gradient(135deg, rgba(74,222,128,0.12), rgba(74,222,128,0.03))',
    border: 'rgba(74,222,128,0.3)',
  },
];

export default function WhyAfnan() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      style={{
        background: '#0d0d0d',
        padding: '110px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div aria-hidden style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', bottom: 0, left: '10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div aria-hidden style={{
        position: 'absolute', top: '20%', right: '5%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '72px' }}
        >
          <span
            className={sg.className}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '100px',
              color: '#a5b4fc',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
            Why Learn From Me
          </span>

          <h2
            className={sg.className}
            style={{
              fontSize: 'clamp(2rem, 4vw, 2.75rem)',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 18px',
            }}
          >
            Everything you need to{' '}
            <span style={{
              background: 'linear-gradient(90deg, #6366f1, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              succeed
            </span>
          </h2>

          <p
            className={inter.className}
            style={{
              color: '#94a3b8',
              fontSize: '1.0625rem',
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.75,
            }}
          >
            My teaching style combines practical depth with clarity — designed specifically for Bangladeshi students.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '24px',
          }}
        >
          {CARDS.map(({ icon: Icon, title, description, color, glow, gradient, border }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 32 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.1 }}
              whileHover={{ y: -6 }}
              style={{
                background: gradient,
                border: `1px solid ${border}`,
                borderRadius: '20px',
                padding: '32px',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'box-shadow 0.3s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 64px rgba(0,0,0,0.4), 0 0 40px ${glow}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Corner glow */}
              <div aria-hidden style={{
                position: 'absolute', top: -40, right: -40,
                width: 140, height: 140, borderRadius: '50%',
                background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Icon */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  background: `${color}18`,
                  border: `1.5px solid ${color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '22px',
                  boxShadow: `0 0 20px ${color}20`,
                }}
              >
                <Icon size={24} color={color} />
              </div>

              {/* Title */}
              <h3
                className={sg.className}
                style={{
                  color: '#f1f5f9',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  marginBottom: '12px',
                  letterSpacing: '-0.015em',
                }}
              >
                {title}
              </h3>

              {/* Description */}
              <p
                className={inter.className}
                style={{
                  color: '#94a3b8',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {description}
              </p>

              {/* Bottom accent line */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
                borderRadius: '0 0 20px 20px',
              }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
