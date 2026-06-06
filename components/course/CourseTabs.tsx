'use client';

import { useState } from 'react';
import { CheckCircle, BookOpen, User } from 'lucide-react';
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
  // Section names are shown, but individual lesson names are intentionally
  // hidden on the public course page — only the section title and lesson count.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {curriculum.map((section, si) => (
        <div
          key={si}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '16px 20px',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <BookOpen size={16} color="#6366f1" style={{ flexShrink: 0 }} />
            <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {section.sectionTitle}
            </span>
          </div>
          <span className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', flexShrink: 0 }}>
            {section.lessons.length} {section.lessons.length === 1 ? 'lesson' : 'lessons'}
          </span>
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
