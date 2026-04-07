'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Code2, Smartphone, Server, ArrowRight, GraduationCap, Users, BookOpen, Clock } from 'lucide-react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const SKILLS = [
  { label: 'React & Next.js', color: '#61dafb', level: 95 },
  { label: 'Node.js & Express', color: '#68d391', level: 90 },
  { label: 'MongoDB', color: '#4ade80', level: 88 },
  { label: 'React Native', color: '#a78bfa', level: 85 },
  { label: 'TypeScript', color: '#60a5fa', level: 82 },
  { label: 'REST APIs', color: '#f59e0b', level: 92 },
];

const SERVICES = [
  {
    icon: Code2,
    title: 'Web Development',
    description: 'Full-stack web apps with MERN stack. From landing pages to complex SaaS platforms.',
    color: '#6366f1',
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Cross-platform iOS & Android apps using React Native. Clean UI, smooth performance.',
    color: '#22d3ee',
  },
  {
    icon: Server,
    title: 'Backend & APIs',
    description: 'Scalable REST APIs, authentication, database design, and cloud deployment.',
    color: '#a78bfa',
  },
];

const STATS = [
  { icon: Users, value: '500+', label: 'Students Taught' },
  { icon: BookOpen, value: '10+', label: 'Courses Created' },
  { icon: Clock, value: '200+', label: 'Hours of Content' },
  { icon: GraduationCap, value: '3+', label: 'Years Teaching' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

import { useRef } from 'react';

export default function AboutPage() {
  const skillsRef = useRef(null);
  const servicesRef = useRef(null);
  const statsRef = useRef(null);
  const skillsInView = useInView(skillsRef, { once: true, margin: '-80px' });
  const servicesInView = useInView(servicesRef, { once: true, margin: '-80px' });
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' });

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '64px' }}>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '90px 0 80px' }}>
        <div aria-hidden style={{
          position: 'absolute', top: '-10%', left: '-5%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '72px', alignItems: 'center' }} className="about-grid">

            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <span className={sg.className} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 16px',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '100px', color: '#a5b4fc',
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  marginBottom: '20px',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
                  About Me
                </span>
              </motion.div>

              <motion.h1
                className={sg.className}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 800, color: '#f8fafc',
                  letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 20px',
                }}
              >
                Hi, I&apos;m{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Afnan Mahmud
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className={inter.className} style={{
                  color: '#94a3b8', fontSize: '1.0625rem', lineHeight: 1.8, marginBottom: '18px',
                }}>
                  I&apos;m a Full Stack Developer and educator passionate about helping Bangladeshi students break into the tech industry. I specialize in the MERN stack and React Native mobile development.
                </p>
                <p className={inter.className} style={{
                  color: '#71717a', fontSize: '1rem', lineHeight: 1.8, marginBottom: '32px',
                }}>
                  I believe the best way to learn programming is by building real projects — not watching endless theory videos. That&apos;s why every course I create is hands-on, practical, and taught in Bangla for maximum clarity.
                </p>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <Link href="/courses" className={sg.className} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    borderRadius: '10px', color: 'white',
                    fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none',
                    boxShadow: '0 0 24px rgba(99,102,241,0.3)',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    View Courses <ArrowRight size={15} />
                  </Link>
                  <Link href="/contact" className={sg.className} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px',
                    background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px', color: '#e2e8f0',
                    fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.color = '#a5b4fc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#e2e8f0'; }}
                  >
                    Contact Me
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right: Avatar */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: 320, height: 320, borderRadius: '28px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))',
                  border: '1.5px solid rgba(99,102,241,0.35)',
                  boxShadow: '0 0 60px rgba(99,102,241,0.2), 0 0 120px rgba(99,102,241,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(34,211,238,0.1) 100%)',
                  }}>
                    <div style={{
                      width: 110, height: 110, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2.75rem', fontWeight: 800, color: 'white',
                      fontFamily: sg.style.fontFamily,
                      boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                    }}>
                      AM
                    </div>
                    <p style={{
                      color: 'rgba(165,180,252,0.7)', fontSize: '0.875rem',
                      marginTop: '14px', fontFamily: inter.style.fontFamily,
                    }}>
                      Full Stack Developer
                    </p>
                  </div>
                </div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', top: '-14px', right: '-14px',
                    padding: '8px 14px',
                    background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)',
                    borderRadius: '100px', color: '#22d3ee',
                    fontSize: '0.8125rem', fontWeight: 700, whiteSpace: 'nowrap',
                    backdropFilter: 'blur(8px)',
                    fontFamily: sg.style.fontFamily,
                  }}
                >
                  3+ Years Experience
                </motion.div>
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', bottom: '-14px', left: '-14px',
                    padding: '8px 14px',
                    background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                    borderRadius: '100px', color: '#a5b4fc',
                    fontSize: '0.8125rem', fontWeight: 700, whiteSpace: 'nowrap',
                    backdropFilter: 'blur(8px)',
                    fontFamily: sg.style.fontFamily,
                  }}
                >
                  500+ Students
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
            {STATS.map(({ icon: Icon, value, label }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={statsInView ? 'visible' : 'hidden'}
                style={{ textAlign: 'center', padding: '24px 16px' }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: '12px',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <Icon size={22} color="#6366f1" />
                </div>
                <div className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.02em', marginBottom: '4px' }}>
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

      {/* Skills */}
      <section ref={skillsRef} style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <span className={sg.className} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', marginBottom: '16px',
              background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.25)',
              borderRadius: '100px', color: '#22d3ee',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', display: 'inline-block' }} />
              My Skills
            </span>
            <h2 className={sg.className} style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800, color: '#f8fafc',
              letterSpacing: '-0.025em', margin: 0,
            }}>
              Technologies I Work With
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {SKILLS.map(({ label, color, level }, i) => (
              <motion.div
                key={label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={skillsInView ? 'visible' : 'hidden'}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '14px',
                  padding: '20px 24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className={sg.className} style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9375rem' }}>{label}</span>
                  <span className={sg.className} style={{ color, fontWeight: 700, fontSize: '0.875rem' }}>{level}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={skillsInView ? { width: `${level}%` } : { width: 0 }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: 'easeOut' }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${color}99, ${color})`,
                      borderRadius: '100px',
                      boxShadow: `0 0 8px ${color}60`,
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section ref={servicesRef} style={{ padding: '0 0 100px', position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '60px' }}
          >
            <span className={sg.className} style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', marginBottom: '16px',
              background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
              borderRadius: '100px', color: '#a78bfa',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
              What I Do
            </span>
            <h2 className={sg.className} style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800, color: '#f8fafc',
              letterSpacing: '-0.025em', margin: 0,
            }}>
              Services & Expertise
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {SERVICES.map(({ icon: Icon, title, description, color }, i) => (
              <motion.div
                key={title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate={servicesInView ? 'visible' : 'hidden'}
                whileHover={{ y: -5 }}
                style={{
                  background: `linear-gradient(135deg, ${color}10, ${color}04)`,
                  border: `1px solid ${color}30`,
                  borderRadius: '20px',
                  padding: '32px',
                  position: 'relative', overflow: 'hidden',
                  transition: 'box-shadow 0.3s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 24px 64px rgba(0,0,0,0.4), 0 0 32px ${color}22`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <div aria-hidden style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 120, height: 120, borderRadius: '50%',
                  background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                <div style={{
                  width: 52, height: 52, borderRadius: '14px',
                  background: `${color}18`, border: `1.5px solid ${color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px', boxShadow: `0 0 20px ${color}20`,
                }}>
                  <Icon size={24} color={color} />
                </div>
                <h3 className={sg.className} style={{
                  color: '#f1f5f9', fontWeight: 700, fontSize: '1.125rem',
                  marginBottom: '12px', letterSpacing: '-0.015em',
                }}>
                  {title}
                </h3>
                <p className={inter.className} style={{
                  color: '#94a3b8', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0,
                }}>
                  {description}
                </p>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
                  borderRadius: '0 0 20px 20px',
                }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={sg.className} style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
              fontWeight: 800, color: '#f8fafc',
              letterSpacing: '-0.025em', marginBottom: '16px',
            }}>
              Ready to start learning?
            </h2>
            <p className={inter.className} style={{
              color: '#71717a', fontSize: '1.0625rem', lineHeight: 1.75, marginBottom: '32px',
            }}>
              Join 500+ students already building real-world skills with Afnan Mahmud.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/courses" className={sg.className} style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '13px 28px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '10px', color: 'white',
                fontWeight: 700, fontSize: '0.9375rem', textDecoration: 'none',
                boxShadow: '0 0 28px rgba(99,102,241,0.35)',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 48px rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'none'; }}
              >
                Browse Courses <ArrowRight size={15} />
              </Link>
              <Link href="/contact" className={sg.className} style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '13px 28px',
                background: 'transparent', border: '1.5px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', color: '#e2e8f0',
                fontWeight: 600, fontSize: '0.9375rem', textDecoration: 'none',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .about-grid > div:last-child { order: -1; }
        }
      `}</style>
    </div>
  );
}
