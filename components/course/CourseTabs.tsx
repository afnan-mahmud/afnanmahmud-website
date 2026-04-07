'use client';

import { useState } from 'react';
import { CheckCircle, Lock, Play, ChevronDown, ChevronUp, BookOpen, User } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import type { ISection } from '@/models/Course';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface CourseTabsProps {
  longDescription?: string;
  curriculum: ISection[];
  whatYouLearn: string[];
}

const TABS = ['Overview', 'Curriculum', 'Instructor'] as const;
type Tab = (typeof TABS)[number];

function OverviewTab({ longDescription, whatYouLearn }: { longDescription?: string; whatYouLearn: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {longDescription && (
        <div>
          <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem', marginBottom: '16px' }}>
            About This Course
          </h3>
          <div
            className={inter.className}
            style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '0.9375rem' }}
            dangerouslySetInnerHTML={{ __html: longDescription }}
          />
        </div>
      )}

      {whatYouLearn.length > 0 && (
        <div>
          <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem', marginBottom: '20px' }}>
            What You&apos;ll Learn
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {whatYouLearn.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(99,102,241,0.05)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: '10px',
                }}
              >
                <CheckCircle size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span className={inter.className} style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CurriculumTab({ curriculum }: { curriculum: ISection[] }) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [playingLesson, setPlayingLesson] = useState<string | null>(null);

  const toggleSection = (i: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {curriculum.map((section, si) => (
        <div
          key={si}
          style={{
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Section header */}
          <button
            onClick={() => toggleSection(si)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'rgba(255,255,255,0.04)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <BookOpen size={16} color="#6366f1" style={{ flexShrink: 0 }} />
              <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {section.sectionTitle}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <span className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem' }}>
                {section.lessons.length} lessons
              </span>
              {openSections.has(si) ? <ChevronUp size={16} color="#6366f1" /> : <ChevronDown size={16} color="#52525b" />}
            </div>
          </button>

          {/* Lessons */}
          {openSections.has(si) && (
            <div>
              {section.lessons.map((lesson, li) => (
                <div key={lesson._id ?? li}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px 12px 44px',
                      borderTop: '1px solid rgba(255,255,255,0.04)',
                      background: playingLesson === lesson._id ? 'rgba(99,102,241,0.06)' : 'transparent',
                    }}
                  >
                    {lesson.isPreview ? (
                      <button
                        onClick={() => setPlayingLesson(playingLesson === lesson._id ? null : lesson._id)}
                        style={{
                          background: 'rgba(99,102,241,0.15)',
                          border: '1px solid rgba(99,102,241,0.3)',
                          borderRadius: '50%',
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        aria-label="Play preview"
                      >
                        <Play size={12} color="#6366f1" fill="#6366f1" />
                      </button>
                    ) : (
                      <div style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Lock size={14} color="#3f3f46" />
                      </div>
                    )}

                    <span
                      className={inter.className}
                      style={{ color: lesson.isPreview ? '#cbd5e1' : '#71717a', fontSize: '0.875rem', flex: 1 }}
                    >
                      {lesson.title}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {lesson.isPreview && (
                        <span
                          className={sg.className}
                          style={{
                            padding: '2px 8px',
                            background: 'rgba(34,211,238,0.1)',
                            border: '1px solid rgba(34,211,238,0.25)',
                            borderRadius: '100px',
                            color: '#22d3ee',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Free Preview
                        </span>
                      )}
                      {lesson.duration && (
                        <span className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem' }}>
                          {lesson.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Inline video player */}
                  {lesson.isPreview && playingLesson === lesson._id && lesson.videoId && (
                    <div style={{ padding: '0 20px 16px 44px' }}>
                      <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: '10px', overflow: 'hidden', background: '#000' }}>
                        <iframe
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                          src={`https://www.youtube.com/embed/${lesson.videoId}?autoplay=1`}
                          title={lesson.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function InstructorTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'white',
            fontFamily: sg.style.fontFamily,
            flexShrink: 0,
            boxShadow: '0 0 30px rgba(99,102,241,0.35)',
          }}
        >
          AM
        </div>

        <div style={{ flex: 1 }}>
          <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem', marginBottom: '4px' }}>
            Afnan Mahmud
          </h3>
          <p className={inter.className} style={{ color: '#6366f1', fontSize: '0.9rem', marginBottom: '14px' }}>
            Full Stack Developer &amp; Educator
          </p>
          <p className={inter.className} style={{ color: '#a1a1aa', fontSize: '0.9375rem', lineHeight: 1.7 }}>
            Afnan Mahmud is a professional MERN Stack and React Native developer with 5+ years of experience building production-grade applications. He has taught 500+ Bangladeshi students through his courses, helping them land their first tech jobs. Afnan believes in teaching through real-world projects that mirror industry standards.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Courses', value: '10+', icon: BookOpen },
          { label: 'Students', value: '500+', icon: User },
          { label: 'Experience', value: '5+ yrs', icon: CheckCircle },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              flex: '1 1 120px',
              padding: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Icon size={18} color="#6366f1" />
            <div>
              <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>{value}</p>
              <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourseTabs({ longDescription, curriculum, whatYouLearn }: CourseTabsProps) {
  const [active, setActive] = useState<Tab>('Overview');

  return (
    <div>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          marginBottom: '32px',
          overflowX: 'auto',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={sg.className}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: active === tab ? '2px solid #6366f1' : '2px solid transparent',
              color: active === tab ? '#6366f1' : '#71717a',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
              marginBottom: '-1px',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {active === 'Overview' && <OverviewTab longDescription={longDescription} whatYouLearn={whatYouLearn} />}
      {active === 'Curriculum' && <CurriculumTab curriculum={curriculum} />}
      {active === 'Instructor' && <InstructorTab />}
    </div>
  );
}
