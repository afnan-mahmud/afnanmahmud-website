'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Space_Grotesk, Inter } from 'next/font/google';
import { BookOpen, Users, Tag, ArrowRight, Search, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const LEVEL_COLOR: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#f59e0b',
  advanced: '#f87171',
};

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

interface Course {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail: string;
  price: number;
  isFree: boolean;
  category: string;
  level: string;
  enrolledCount: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px', overflow: 'hidden',
    }}>
      <div style={{ height: 180, background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ padding: '22px' }}>
        <div style={{ height: 18, background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 10, width: '75%' }} />
        <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginBottom: 6, width: '100%' }} />
        <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginBottom: 20, width: '60%' }} />
        <div style={{ height: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 6, width: '40%' }} />
      </div>
    </div>
  );
}

export default function CoursesClient() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeLevel, setActiveLevel] = useState('all');

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to load courses');
      setCourses(data.courses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const levels = ['all', ...Array.from(new Set(courses.map((c) => c.level)))];

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase());
    const matchLevel = activeLevel === 'all' || c.level === activeLevel;
    return matchSearch && matchLevel;
  });

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', paddingTop: '64px' }}>

      {/* Hero */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 64px' }}>
        <div aria-hidden style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
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
              All Courses
            </span>

            <h1 className={sg.className} style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
              fontWeight: 800, color: '#f8fafc',
              letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 18px',
            }}>
              Learn. Build.{' '}
              <span style={{
                background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Get Hired.
              </span>
            </h1>

            <p className={inter.className} style={{
              color: '#94a3b8', fontSize: '1.0625rem',
              maxWidth: '520px', margin: '0 auto 40px', lineHeight: 1.75,
            }}>
              Real-world courses in Bangla. Build projects, master skills, and launch your dev career.
            </p>

            {/* Search */}
            <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
              <Search size={16} color="#52525b" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={inter.className}
                style={{
                  width: '100%', padding: '13px 16px 13px 44px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#e2e8f0', fontSize: '0.9375rem',
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter tabs */}
      {!loading && !error && courses.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 40px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Layers size={14} color="#52525b" />
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveLevel(lvl)}
                className={sg.className}
                style={{
                  padding: '6px 16px', borderRadius: '100px', border: '1px solid',
                  fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeLevel === lvl ? 'rgba(99,102,241,0.15)' : 'transparent',
                  borderColor: activeLevel === lvl ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
                  color: activeLevel === lvl ? '#a5b4fc' : '#71717a',
                  textTransform: 'capitalize',
                }}
              >
                {lvl === 'all' ? 'All Levels' : LEVEL_LABEL[lvl] ?? lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 100px' }}>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}>
                <SkeletonCard />
              </motion.div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 24px' }}
          >
            <div style={{
              width: 64, height: 64, borderRadius: '16px',
              background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <AlertCircle size={28} color="#f87171" />
            </div>
            <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem', marginBottom: '10px' }}>
              Could not load courses
            </h3>
            <p className={inter.className} style={{ color: '#71717a', fontSize: '0.9375rem', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px', lineHeight: 1.7 }}>
              {error}
            </p>
            <button
              onClick={fetchCourses}
              className={sg.className}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 24px',
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '10px', color: '#a5b4fc',
                fontWeight: 600, fontSize: '0.9375rem', cursor: 'pointer', fontFamily: 'inherit',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: '80px 0' }}
          >
            <BookOpen size={48} color="#27272a" style={{ margin: '0 auto 16px', display: 'block' }} />
            <p className={inter.className} style={{ color: '#52525b', fontSize: '1rem' }}>
              {courses.length === 0 ? 'No courses published yet. Check back soon!' : 'No courses match your search.'}
            </p>
          </motion.div>
        )}

        {/* Course grid */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {filtered.map((course, i) => (
              <motion.div
                key={course._id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -4 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px', overflow: 'hidden',
                  transition: 'border-color 0.25s, box-shadow 0.25s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.35), 0 0 30px rgba(99,102,241,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: 180, position: 'relative', overflow: 'hidden',
                  background: course.thumbnail
                    ? 'transparent'
                    : 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(34,211,238,0.1) 100%)',
                }}>
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                      }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                        <BookOpen size={36} color="rgba(99,102,241,0.6)" />
                        <span className={sg.className} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {course.category || 'Course'}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Level badge */}
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    padding: '4px 10px',
                    background: `${LEVEL_COLOR[course.level] ?? '#a1a1aa'}18`,
                    border: `1px solid ${LEVEL_COLOR[course.level] ?? '#a1a1aa'}44`,
                    borderRadius: '100px',
                    color: LEVEL_COLOR[course.level] ?? '#a1a1aa',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    backdropFilter: 'blur(8px)', fontFamily: sg.style.fontFamily,
                  }}>
                    {LEVEL_LABEL[course.level] ?? course.level}
                  </div>

                  {/* Price badge */}
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '4px 10px',
                    background: course.isFree ? 'rgba(74,222,128,0.9)' : 'rgba(99,102,241,0.9)',
                    borderRadius: '100px',
                    color: 'white', fontSize: '0.8rem', fontWeight: 700,
                    backdropFilter: 'blur(8px)', fontFamily: sg.style.fontFamily,
                  }}>
                    <Tag size={11} />
                    {course.isFree ? 'Free' : `৳${course.price.toLocaleString()}`}
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '22px' }}>
                  <h3 className={sg.className} style={{
                    color: '#f1f5f9', fontWeight: 700, fontSize: '1.0625rem',
                    marginBottom: '10px', letterSpacing: '-0.015em', lineHeight: 1.35,
                  }}>
                    {course.title}
                  </h3>
                  <p className={inter.className} style={{
                    color: '#71717a', fontSize: '0.875rem', lineHeight: 1.65, marginBottom: '20px',
                  }}>
                    {course.shortDescription || 'Click to view course details.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={13} color="#52525b" />
                      <span className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem' }}>
                        {course.enrolledCount.toLocaleString()} enrolled
                      </span>
                    </div>
                    <Link
                      href={`/courses/${course.slug}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        color: '#818cf8', fontSize: '0.875rem', fontWeight: 600,
                        textDecoration: 'none', transition: 'gap 0.2s',
                        fontFamily: sg.style.fontFamily,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.gap = '8px'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.gap = '5px'; }}
                    >
                      View Course <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
