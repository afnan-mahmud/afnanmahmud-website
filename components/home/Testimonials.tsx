'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Quote } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const TESTIMONIALS = [
  {
    quote:
      'Afnan vai\'s course completely changed my career. I got my first remote job 3 months after finishing the MERN stack course. The projects are real and interviewers were impressed!',
    name: 'Rakib Hasan',
    role: 'Junior Web Developer @ TechBD',
    initials: 'RH',
    color: '#6366f1',
  },
  {
    quote:
      'Finally a course in Bangla that doesn\'t skip the hard parts. I\'ve tried many others but Afnan explains everything step by step. The community support is also amazing.',
    name: 'Fatema Akter',
    role: 'React Developer @ Startup',
    initials: 'FA',
    color: '#22d3ee',
  },
  {
    quote:
      'The React Native module helped me publish my first app on Play Store. I had zero mobile experience before. Lifetime access means I keep coming back when I need a refresher.',
    name: 'Tanvir Ahmed',
    role: 'Mobile App Developer',
    initials: 'TA',
    color: '#a78bfa',
  },
];

function Stars() {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      style={{
        background: '#0a0a0a',
        padding: '100px 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div aria-hidden style={{
        position: 'absolute', top: 0, right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <span
            className={sg.className}
            style={{
              display: 'inline-block',
              padding: '5px 12px',
              background: 'rgba(34,211,238,0.08)',
              border: '1px solid rgba(34,211,238,0.2)',
              borderRadius: '100px',
              color: '#22d3ee',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Student Stories
          </span>
          <h2
            className={sg.className}
            style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              letterSpacing: '-0.02em',
              margin: '0 0 16px',
            }}
          >
            Loved by{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              500+ students
            </span>
          </h2>
          <p className={inter.className} style={{ color: '#71717a', fontSize: '1.0625rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
            Real results from real students who took the leap.
          </p>
        </motion.div>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {TESTIMONIALS.map(({ quote, name, role, initials, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.12 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Quote icon */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  opacity: 0.15,
                }}
              >
                <Quote size={36} color={color} />
              </div>

              <Stars />

              <p
                className={inter.className}
                style={{
                  color: '#a1a1aa',
                  fontSize: '0.9375rem',
                  lineHeight: 1.7,
                  margin: 0,
                  fontStyle: 'italic',
                  flex: 1,
                }}
              >
                &ldquo;{quote}&rdquo;
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color}44, ${color}22)`,
                    border: `1.5px solid ${color}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: color,
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    fontFamily: sg.style.fontFamily,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>{name}</p>
                  <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: 0 }}>{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
