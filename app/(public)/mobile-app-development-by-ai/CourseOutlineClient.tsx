'use client';

import { useState, useEffect } from 'react';
import { Inter, Poppins } from 'next/font/google';
import type { CourseData } from '@/app/(public)/mobile-app-development-by-ai/data';
import EnrollModal from './EnrollModal';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'] });

/* ── Light-mode tag style overrides ──────────────────────────────────────── */
const TAG_LIGHT: Record<string, { bg: string; color: string; border: string; emoji: string; label: string }> = {
  project:  { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: 'rgba(22,163,74,0.25)',   emoji: '🔨', label: 'Mini Project' },
  concept:  { bg: 'rgba(98,95,255,0.1)',   color: '#625fff', border: 'rgba(98,95,255,0.25)',   emoji: '💡', label: 'Concept' },
  ai:       { bg: 'rgba(219,39,119,0.1)',  color: '#db2777', border: 'rgba(219,39,119,0.25)',  emoji: '🤖', label: 'AI-Powered' },
  advanced: { bg: 'rgba(217,119,6,0.1)',   color: '#d97706', border: 'rgba(217,119,6,0.25)',   emoji: '⚡', label: 'Advanced' },
  bridge:   { bg: 'rgba(8,145,178,0.1)',   color: '#0891b2', border: 'rgba(8,145,178,0.25)',   emoji: '🔗', label: 'JS → TS Bridge' },
  business: { bg: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: 'rgba(22,163,74,0.25)',   emoji: '💼', label: 'Business' },
  ship:     { bg: 'rgba(6,182,212,0.1)',   color: '#0891b2', border: 'rgba(6,182,212,0.25)',   emoji: '🚀', label: 'Ship It' },
};

/* ── Light-mode phase accent overrides (readable on white) ───────────────── */
const PHASE_ACCENT_LIGHT: Record<number, string> = {
  0: '#7c3aed',
  1: '#0284c7',
  2: '#059669',
  3: '#d97706',
  4: '#db2777',
  5: '#7c3aed',
  6: '#0891b2',
};

export default function CourseOutlineClient({ data }: { data: CourseData }) {
  const { phases, stack, capstoneFeatures } = data;

  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [enrollOpen, setEnrollOpen] = useState(false);

  // Auto-open the enroll modal after a failed payment retry (?retry=1).
  // Reads the URL (external system) once on mount — a legitimate effect.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('retry') === '1') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnrollOpen(true);
    }
  }, []);

  const activePhase = phases[activePhaseIdx];
  const phaseColor = PHASE_ACCENT_LIGHT[activePhaseIdx] ?? '#625fff';

  const ACCENT = '#625fff';

  function handlePhaseChange(idx: number) {
    setActivePhaseIdx(idx);
  }

  return (
    <div className={inter.className} style={{ background: '#ffffff', minHeight: '100vh', overflowX: 'hidden', color: '#1a1814' }}>

      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} />

      {/* ── STICKY NAV ─────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e8e6e0',
        padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <div className={poppins.className} style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>
          Afnan <span style={{ color: ACCENT }}>Mahmud</span>
        </div>
        <button onClick={() => setEnrollOpen(true)} style={{
          background: ACCENT, color: 'white', border: 'none', borderRadius: 50,
          padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(98,95,255,0.3)',
        }}>
          এখনই Enroll করো →
        </button>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        background: '#fafaf8', padding: '72px 24px 0',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle radial glow */}
        <div aria-hidden style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(98,95,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div className={inter.className} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(98,95,255,0.08)', border: '1px solid rgba(98,95,255,0.25)',
          borderRadius: 50, padding: '6px 18px',
          fontSize: 13, fontWeight: 600, color: ACCENT,
          marginBottom: 28,
        }}>
          <span style={{ width: 7, height: 7, background: ACCENT, borderRadius: '50%', display: 'inline-block', animation: 'hBlink 1.5s infinite' }} />
          Bangladesh&apos;s First AI-First Dev Course
        </div>

        {/* Headline */}
        <h1 className={poppins.className} style={{
          fontSize: 'clamp(30px,4.8vw,60px)', fontWeight: 800,
          lineHeight: 1.15, letterSpacing: '-0.5px',
          color: '#1a1814', maxWidth: 860, margin: '0 auto 16px',
        }}>
          ক্যারিয়ার গড়ো <span style={{ color: ACCENT }}>Mobile App</span> আর<br />
          <span style={{ position: 'relative', display: 'inline-block' }}>
            Custom Website
            <span style={{
              position: 'absolute', bottom: 4, left: 0, right: 0,
              height: 4, background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
              borderRadius: 2, display: 'block',
            }} />
          </span>{' '} ডেভেলপমেন্ট শিখে - সম্পূর্ণ AI দিয়ে
        </h1>

        <p style={{
          fontSize: 'clamp(16px,2vw,19px)', color: '#4a4740',
          maxWidth: 640, margin: '0 auto 36px', fontWeight: 500, lineHeight: 1.7,
        }}>
          Programming, software development নিয়ে আগে কোনো idea না থাকলেও সমস্যা নেই।{' '}
          <strong style={{ color: '#1a1814' }}>একদম beginner level থেকে</strong> শুরু করে
          professional developer হওয়ার complete roadmap।
        </p>

        {/* ── AI 90% HIGHLIGHT CARD ──────────────────────────────── */}
        <div style={{
          maxWidth: 780, margin: '0 auto 40px',
          background: 'linear-gradient(135deg, rgba(98,95,255,0.06), rgba(167,139,250,0.06))',
          border: `1.5px solid rgba(98,95,255,0.22)`,
          borderRadius: 20, padding: '32px 36px',
          textAlign: 'left', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative number */}
          <div className={poppins.className} aria-hidden style={{
            position: 'absolute', right: 24, top: -10,
            fontSize: 120, fontWeight: 800, color: 'rgba(98,95,255,0.05)',
            pointerEvents: 'none', userSelect: 'none', lineHeight: 1,
          }}>90%</div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'rgba(98,95,255,0.12)', border: '1px solid rgba(98,95,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
            }}>🤖</div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className={inter.className} style={{
                fontSize: 12, color: ACCENT, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
              }}>
                এই course-এর সবচেয়ে বড় পার্থক্য
              </div>
              <h3 className={poppins.className} suppressHydrationWarning style={{
                fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700,
                color: '#1a1814', marginBottom: 10, lineHeight: 1.25,
              }}>
                {'AI দিয়ে কোড লিখবে '}<span style={{ color: ACCENT }}>{'৯০%'}</span>{' — তুমি শুধু Architecture বানাবে সেটাও আবার AI দিয়ে করতে পারবে'}
              </h3>
              <p style={{ fontSize: 15, color: '#4a4740', lineHeight: 1.75, margin: 0 }}>
                তুমি software-এর structure আর logic design করবে — তারপর AI-কে সেই architecture-এর flow বুঝিয়ে দেবে।
                AI তোমার দেওয়া plan অনুযায়ী <strong style={{ color: '#1a1814' }}>পুরো software তৈরি করে দেবে</strong>।
                এটাই ২০২৬-এর professional developer-দের real workflow।
              </p>
            </div>
          </div>

          {/* 3 mini points */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '🏗️', text: 'তুমি AI দিয়ে Architecture design করবা' },
              { icon: '🤖', text: 'AI পুরো code লিখে দিবে' },
              { icon: '🚀', text: 'তুমি deploy করবে, তারপর launch করবে' },
            ].map((item) => (
              <div key={item.text} style={{
                flex: '1', minWidth: 160,
                background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(98,95,255,0.15)',
                borderRadius: 10, padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, fontWeight: 700, color: '#1a1814',
              }}>
                <span>{item.icon}</span> {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
          <button onClick={() => setEnrollOpen(true)} style={{
            background: ACCENT, color: 'white', border: 'none', borderRadius: 50,
            padding: '16px 36px', fontSize: 16, fontWeight: 800,
            fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 20px rgba(98,95,255,0.3)',
          }}>
            ৫,০০০ টাকার এই কোর্সে Early Bird-এ Enroll করো মাত্র ৳৯৯০ দিয়ে →
          </button>
          <a href="#curriculum" style={{
            background: 'transparent', color: '#1a1814',
            border: '1.5px solid #d0cdc4', borderRadius: 50,
            padding: '15px 32px', fontSize: 16, fontWeight: 700,
            textDecoration: 'none', display: 'inline-block',
          }}>
            Course দেখো
          </a>
        </div>

        {/* Stats row */}
        {/* <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap',
          borderTop: '1px solid #e8e6e0', background: 'white', margin: '0 -24px',
        }}>
          {[
            { val: '28+', label: 'Modules' },
            { val: '6',   label: 'Phases' },
            { val: '5+',  label: 'Live Projects' },
            { val: '2',   label: 'Platforms (Web + Mobile)' },
            { val: '∞',   label: 'Lifetime Access' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 130, padding: '24px 20px', textAlign: 'center',
              borderRight: i < arr.length - 1 ? '1px solid #e8e6e0' : 'none',
            }}>
              <div className={poppins.className} style={{ fontSize: 28, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>
                {s.val}
              </div>
              <div className={inter.className} style={{ fontSize: 12, color: '#8c8880', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div> */}
      </section>

      {/* ── WHAT YOU WILL LEARN ──────────────────────────────────── */}
      <section style={{ background: '#f4f3ef', padding: '64px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className={inter.className} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: ACCENT, marginBottom: 14,
            }}>
              <span style={{ width: 24, height: 2, background: ACCENT, display: 'inline-block', borderRadius: 1 }} />
              এই Course শেষে তুমি কী শিখতে পারবে ?
            </div>
            <h2 className={poppins.className} style={{
              fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700,
              lineHeight: 1.2, margin: 0,
            }}>
              Beginner থেকে <span style={{ color: ACCENT }}>Full Website and Mobile App Developer</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px,1fr))', gap: 16 }}>
            {[
              { icon: '📱', title: 'Mobile App বানাতে পারবে', desc: 'React Native দিয়ে Android ও iOS দুটোর জন্য একটাই codebase থেকে app build করা শিখবে।' },
              { icon: '🌐', title: 'Custom Website বানাতে পারবে', desc: 'MERN Stack এর Next.js দিয়ে professional website ও web app তৈরি করতে পারবে।' },
              { icon: '📁', title: 'Code Manage করা শিখবে', desc: 'GitHub দিয়ে code version control, team workflow, আর professional delivery শিখতে পারবে।' },
              { icon: '🚀', title: 'Website Live করতে পারবে', desc: 'VPS, Docker, CI/CD দিয়ে website deploy করে — production-ready করতে পারবে।' },
              { icon: '🏪', title: 'Play Store-এ App Publish করতে পারবে', desc: 'Play Store (Android) ও App Store (iOS)-এ app submit থেকে approval পর্যন্ত পুরো process শিখতে পারবে।' },
              { icon: '💼', title: 'Career শুরু', desc: 'Freelancing, job, বা নিজের startup — যেকোনো পথে software developer হিসেবে career শুরু করতে পারবে।' },
            ].map((card) => (
              <div key={card.title} style={{
                background: 'white', border: '1px solid #e8e6e0', borderRadius: 16,
                padding: '26px 22px', transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
              }}
              className="outcome-card"
              >
                <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, color: '#1a1814' }}>{card.title}</h3>
                <p style={{ fontSize: 13.5, color: '#4a4740', lineHeight: 1.65, margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Enroll CTA inside section */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <p style={{ fontSize: 16, color: '#4a4740', marginBottom: 20, fontWeight: 600 }}>
              Software developer-এর career-এ পিছিয়ে পড়তে না চাইলে এখনই enroll করো।
            </p>
            <button onClick={() => setEnrollOpen(true)} style={{
              background: ACCENT, color: 'white', borderRadius: 50,
              padding: '14px 36px', fontSize: 15, fontWeight: 800,
              border: 'none', fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(98,95,255,0.28)',
            }}>
              এখনই Enroll করো ৯৯০ টাকা অফার প্রাইজে→
            </button>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ───────────────────────────────────────────── */}
      <section style={{ background: 'white', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <div className={inter.className} style={{
            fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
            color: '#8c8880', marginBottom: 20,
          }}>এই Course-এ কী কী Technologies শিখতে পারবে ?</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {[
              { label: 'MongoDB',                  bg: 'rgba(0,200,80,0.08)',   color: '#059669', border: 'rgba(0,200,80,0.25)' },
              { label: 'Express.js',               bg: '#f4f3ef',               color: '#374151', border: '#e0ddd6' },
              { label: 'React / Next.js',          bg: 'rgba(6,182,212,0.08)',  color: '#0891b2', border: 'rgba(6,182,212,0.25)' },
              { label: 'Node.js',                  bg: 'rgba(34,197,94,0.08)', color: '#16a34a', border: 'rgba(34,197,94,0.25)' },
              { label: 'React Native',             bg: 'rgba(98,95,255,0.08)',  color: '#625fff', border: 'rgba(98,95,255,0.25)' },
              { label: 'TypeScript',                bg: 'rgba(217,119,6,0.08)', color: '#d97706', border: 'rgba(217,119,6,0.25)' },
              { label: 'AI Models', bg: 'rgba(219,39,119,0.08)', color: '#db2777', border: 'rgba(219,39,119,0.25)' },
              { label: 'Docker · CI/CD',               bg: 'rgba(37,99,235,0.08)', color: '#2563eb', border: 'rgba(37,99,235,0.25)' },
            ].map((p) => (
              <span key={p.label} className={inter.className} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 18px', borderRadius: 50, border: `1.5px solid ${p.border}`,
                fontSize: 13, fontWeight: 500, background: p.bg, color: p.color,
              }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURRICULUM ─────────────────────────────────────────── */}
      <section id="curriculum" style={{ background: '#fafaf8', padding: '72px 0 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className={inter.className} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
              textTransform: 'uppercase', color: ACCENT, marginBottom: 14,
            }}>
              <span style={{ width: 24, height: 2, background: ACCENT, display: 'inline-block', borderRadius: 1 }} />
              Course Curriculum
            </div>
            <h2 className={poppins.className} style={{
              fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 700,
              lineHeight: 1.2, marginBottom: 14,
            }}>
              ২৮টা Module, <span style={{ color: ACCENT }}>৬টা Phase</span>
            </h2>
            <p style={{ fontSize: 16, color: '#4a4740', maxWidth: 560, margin: '0 auto', fontWeight: 500, lineHeight: 1.65 }}>
              JavaScript দিয়ে আমরা শুরু করবো, তারপর Website + Mobile App দুটোই AI দিয়ে build করবো।
            </p>
          </div>

          {/* ── SCROLLABLE PHASE TABS ─────────────────────────── */}
          <div className={inter.className} style={{
            fontSize: 12, color: '#8c8880', textTransform: 'uppercase',
            letterSpacing: '0.05em', fontWeight: 600, marginBottom: 12,
          }}>
            কি কি Phase থাকবে এখানে
          </div>

          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 36,
            scrollbarWidth: 'none',
          }} className="phase-scroller">
            {phases.map((phase, idx) => {
              const isActive = idx === activePhaseIdx;
              const pc = PHASE_ACCENT_LIGHT[idx] ?? ACCENT;
              return (
                <button
                  key={phase.id}
                  onClick={() => handlePhaseChange(idx)}
                  className={inter.className}
                  style={{
                    flexShrink: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 3, padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                    transition: 'all 0.2s', minWidth: 72, fontSize: 12, fontWeight: 600,
                    background: isActive ? `${pc}12` : 'white',
                    border: `1.5px solid ${isActive ? pc + '50' : '#e8e6e0'}`,
                    color: isActive ? pc : '#8c8880',
                    boxShadow: isActive ? `0 2px 12px ${pc}22` : 'none',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 16, lineHeight: 1 }}>{phase.phaseNum}</span>
                  <span style={{ fontSize: 9, opacity: 0.8 }}>{phase.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* ── ACTIVE PHASE HEADER ───────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 18,
            padding: '22px 26px', borderRadius: 16, marginBottom: 24,
            background: `${phaseColor}08`, border: `1.5px solid ${phaseColor}25`,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: `${phaseColor}15`, border: `1px solid ${phaseColor}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span className={poppins.className} style={{ color: phaseColor, fontWeight: 800, fontSize: 20 }}>
                {activePhase.phaseNum}
              </span>
            </div>
            <div>
              <div className={inter.className} style={{
                color: '#8c8880', fontSize: 12, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6,
              }}>
                {activePhase.label}
              </div>
              <h3 className={poppins.className} style={{
                color: '#1a1814', fontSize: 'clamp(17px,2.2vw,22px)',
                fontWeight: 700, margin: '0 0 8px',
              }}>
                {activePhase.title}
              </h3>
              <p style={{ color: '#4a4740', fontSize: 14, lineHeight: 1.75, margin: 0, maxWidth: 700 }}>
                {activePhase.description}
              </p>
            </div>
          </div>

          {/* ── ALL MODULES IN THIS PHASE ────────────────────── */}
          <div style={{
            background: 'white', border: '1px solid #e8e6e0',
            borderRadius: 16, padding: 24, marginBottom: 32,
          }}>
            <div className={inter.className} style={{
              fontSize: 12, color: '#8c8880', textTransform: 'uppercase',
              fontWeight: 600, letterSpacing: '0.04em', marginBottom: 14,
            }}>
              এই Phase-এর সব Module
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 10 }}>
              {activePhase.modules.map((mod) => {
                const mts = TAG_LIGHT[mod.tagStyle] ?? TAG_LIGHT.concept;
                return (
                  <div
                    key={mod.num}
                    style={{
                      padding: 14, borderRadius: 10,
                      background: '#fafaf8', border: '1px solid #e8e6e0',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className={inter.className} style={{
                        fontSize: 11, fontWeight: 600, color: '#8c8880',
                      }}>
                        Module {mod.num}
                      </span>
                      <span className={inter.className} style={{
                        fontSize: 10, background: mts.bg, color: mts.color,
                        border: `1px solid ${mts.border}`, padding: '1px 6px', borderRadius: 3,
                      }}>
                        {mts.emoji}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12.5, color: '#4a4740',
                      lineHeight: 1.4, display: 'block', fontWeight: 500,
                    }}>
                      {mod.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ── CAPSTONE ────────────────────────────────────────────── */}
      <section style={{ background: '#1a1814', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🎓</span>
            <span className={inter.className} style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Final Capstone Project
            </span>
          </div>
          <h2 className={poppins.className} style={{
            fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 700, marginBottom: 16,
            background: 'linear-gradient(90deg, #a78bfa, #22d3ee)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Course শেষে তুমি একটি Real SaaS App Build করবে
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.85, maxWidth: 720, margin: '0 auto 32px' }}>
            Web (Next.js) + Mobile (React Native) + Backend (Node/Express/MongoDB) — সব মিলিয়ে একটা deployable product।
            শুধু শেখা না — তুমি actually কিছু একটা বানাবে।
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {capstoneFeatures.map((f) => (
              <span key={f} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 8, padding: '8px 18px', fontSize: 13,
                color: 'rgba(255,255,255,0.8)', fontWeight: 600,
              }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: '#fafaf8', padding: '80px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className={inter.className} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
              color: ACCENT, marginBottom: 14,
            }}>
              <span style={{ width: 24, height: 2, background: ACCENT, display: 'inline-block', borderRadius: 1 }} />
              Pricing
            </div>
            <h2 className={poppins.className} style={{
              fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 700, marginBottom: 12,
            }}>এখনই শুরু করো</h2>
            <p style={{ fontSize: 16, color: '#4a4740', fontWeight: 500 }}>
              Early Bird অফার শেষ হলে price বেড়ে যাবে — দেরি করলে বেশি দিতে হবে।
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 540px)', gap: 24, justifyContent: 'center' }}>
            {/* Early Bird */}
            <div style={{
              background: 'white', borderRadius: 24, padding: '36px 32px',
              border: `2px solid ${ACCENT}`, position: 'relative', overflow: 'hidden',
              boxShadow: `0 0 0 1px ${ACCENT}18, 0 12px 40px rgba(98,95,255,0.12)`,
            }}>
              <span className={inter.className} style={{
                position: 'absolute', top: 20, right: 20,
                background: ACCENT, color: 'white', fontSize: 11, fontWeight: 700,
                padding: '4px 12px', borderRadius: 50,
              }}>
                🔥 EARLY BIRD
              </span>
              <div className={inter.className} style={{ fontSize: 12, color: '#8c8880', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 12 }}>
                Early Bird Price
              </div>
              <div className={poppins.className} style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, color: ACCENT, marginBottom: 4 }}>
                <span style={{ fontSize: 24, verticalAlign: 'super', letterSpacing: 0 }}>৳</span>990
              </div>
              <div style={{ fontSize: 13, color: '#8c8880', textDecoration: 'line-through', marginBottom: 16, fontWeight: 600 }}>
                Regular price: ৳৫,০০০
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['সব ২৮টা Module-এর Lifetime Access', 'প্রতিটা project-এর Source Code', 'AI Prompt Templates + .cursorrules files', 'Private Community Group Access', 'Regular Live Q&A Sessions', 'নতুন Module যোগ হলে Free-তে পাবে', 'Certificate of Completion'].map((f) => (
                  <li key={f} style={{ fontSize: 14, color: '#4a4740', display: 'flex', alignItems: 'flex-start', gap: 10, lineHeight: 1.5 }}>
                    <span style={{ color: '#16a34a', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => setEnrollOpen(true)} style={{
                width: '100%', padding: '16px', borderRadius: 50, fontSize: 15, fontWeight: 800,
                fontFamily: 'inherit', cursor: 'pointer', background: ACCENT, color: 'white', border: 'none',
                boxShadow: `0 4px 16px rgba(98,95,255,0.28)`,
              }}>
                Early Bird-এ Enroll করো →
              </button>
            </div>

          </div>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8c8880' }}>
            ৭ দিনের মধ্যে ভালো না লাগলে Full Refund — No questions asked।
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(135deg, rgba(98,95,255,0.06), rgba(167,139,250,0.06))`,
        borderTop: '1px solid rgba(98,95,255,0.15)',
        padding: '80px 24px', textAlign: 'center',
      }}>
        <div className={inter.className} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center',
          fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          color: ACCENT, marginBottom: 20,
        }}>
          <span style={{ width: 24, height: 2, background: ACCENT, display: 'inline-block', borderRadius: 1 }} />
          এখনই সুযোগ নাও
        </div>
        <h2 className={poppins.className} style={{
          fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, maxWidth: 700,
          margin: '0 auto 16px', lineHeight: 1.2,
        }}>
          Software Developer-এর Career-এ{' '}
          <span style={{ color: ACCENT }}>পিছিয়ে থাকার</span> সময় নেই
        </h2>
        <p style={{ fontSize: 16, color: '#4a4740', maxWidth: 500, margin: '0 auto 36px', fontWeight: 500, lineHeight: 1.65 }}>
          ৳৯৯০-তে শুরু করো। AI দিয়ে code করতে শেখো। নিজের app বানাও। Career পরিবর্তন করো।
        </p>
        <button onClick={() => setEnrollOpen(true)} style={{
          background: ACCENT, color: 'white', borderRadius: 50,
          padding: '18px 44px', fontSize: 17, fontWeight: 800,
          border: 'none', fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(98,95,255,0.32)',
        }}>
          Early Bird-এ Enroll করো — ৳৯৯০ →
        </button>
        <p style={{ marginTop: 16, fontSize: 13, color: '#8c8880' }}>
          ৭ দিনের মধ্যে ভালো না লাগলে Full Refund
        </p>
      </section>

      {/* ── Global styles ─────────────────────────────────────── */}
      <style>{`
        @keyframes hBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .phase-scroller::-webkit-scrollbar { display: none; }
        button { font-family: inherit; }
        .outcome-card:hover {
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
          transform: translateY(-3px);
        }
        .outcome-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: #625fff;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s;
          border-radius: 3px 3px 0 0;
        }
        .outcome-card:hover::before { transform: scaleX(1); }
        @media (max-width: 700px) {
          .module-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
