import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Refund } from '@/models/Refund';
import { Space_Grotesk, Inter } from 'next/font/google';
import { BookOpen, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import type { ICourse } from '@/models/Course';
import type { IProgress } from '@/models/User';
import type { Types } from 'mongoose';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface PopulatedUser {
  name: string;
  purchasedCourses: ICourse[];
  progress: IProgress[];
  createdAt: Date;
}

function getTotalLessons(course: ICourse): number {
  return course.curriculum.reduce((s, sec) => s + sec.lessons.length, 0);
}

function getCompletedCount(courseId: Types.ObjectId | string, progress: IProgress[]): number {
  const entry = progress.find((p) => p.courseId.toString() === courseId.toString());
  return entry?.completedLessons?.length ?? 0;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/otp');

  await connectDB();
  void Course;

  const user = await User.findById(session.user.id)
    .populate<{ purchasedCourses: ICourse[] }>('purchasedCourses')
    .lean<PopulatedUser>();

  if (!user) redirect('/auth/otp');

  const refunds = await Refund.find({
    student: session.user.id,
    status: { $in: ['requested', 'confirmed'] },
  })
    .select('courseTitle status')
    .sort({ createdAt: -1 })
    .lean<{ courseTitle: string; status: 'requested' | 'confirmed' }[]>();

  const courses = user.purchasedCourses ?? [];
  const progress = user.progress ?? [];

  const totalCompleted = progress.reduce((sum, p) => sum + (p.completedLessons?.length ?? 0), 0);
  const firstName = user.name.split(' ')[0];

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1100px' }} className="dash-content">
      {/* Welcome */}
      <div style={{ marginBottom: '40px' }}>
        <h1
          className={sg.className}
          style={{
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
            marginBottom: '6px',
          }}
        >
          Welcome back,{' '}
          <span style={{ background: 'linear-gradient(135deg, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {firstName}!
          </span>
        </h1>
        <p className={inter.className} style={{ color: '#71717a', fontSize: '0.9375rem' }}>
          Here&apos;s your learning overview.
        </p>
      </div>

      {/* Stats cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '48px',
        }}
      >
        {[
          {
            icon: BookOpen,
            label: 'Enrolled Courses',
            value: courses.length,
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.08)',
            border: 'rgba(99,102,241,0.2)',
          },
          {
            icon: CheckCircle,
            label: 'Lessons Completed',
            value: totalCompleted,
            color: '#22d3ee',
            bg: 'rgba(34,211,238,0.07)',
            border: 'rgba(34,211,238,0.18)',
          },
          {
            icon: Clock,
            label: 'Last Active',
            value: 'Today',
            color: '#a78bfa',
            bg: 'rgba(167,139,250,0.08)',
            border: 'rgba(167,139,250,0.2)',
          },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div
            key={label}
            style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: bg,
                border: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <Icon size={18} color={color} />
            </div>
            <p
              className={sg.className}
              style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.75rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}
            >
              {value}
            </p>
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: 0 }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div>
        <h2
          className={sg.className}
          style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em', marginBottom: '20px' }}
        >
          My Courses
        </h2>

        {courses.length === 0 ? (
          <div
            style={{
              padding: '60px 24px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.03)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '16px',
            }}
          >
            <BookOpen size={40} color="#3f3f46" style={{ marginBottom: '16px' }} />
            <h3 className={sg.className} style={{ color: '#71717a', fontWeight: 600, fontSize: '1.125rem', marginBottom: '8px' }}>
              No courses yet
            </h3>
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.9rem', marginBottom: '24px' }}>
              Start learning today by enrolling in a course.
            </p>
            <Link
              href="/courses"
              className={sg.className}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.875rem',
              }}
            >
              Explore Courses
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {courses.map((course) => {
              const total = getTotalLessons(course);
              const completed = getCompletedCount(course._id as Types.ObjectId, progress);
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

              return (
                <div
                  key={course._id?.toString()}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      height: 140,
                      background: course.thumbnail
                        ? `url(${course.thumbnail}) center/cover`
                        : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.12))',
                      position: 'relative',
                    }}
                  >
                    {!course.thumbnail && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
                        ⚡
                      </div>
                    )}
                    {/* Progress pill */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        padding: '3px 10px',
                        background: 'rgba(10,10,10,0.8)',
                        backdropFilter: 'blur(6px)',
                        borderRadius: '100px',
                        color: pct === 100 ? '#4ade80' : '#a5b4fc',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: sg.style.fontFamily,
                      }}
                    >
                      {pct}%
                    </div>
                  </div>

                  <div style={{ padding: '18px' }}>
                    <h3
                      className={sg.className}
                      style={{
                        color: '#f1f5f9',
                        fontWeight: 700,
                        fontSize: '0.9375rem',
                        marginBottom: '12px',
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {course.title}
                    </h3>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '14px' }}>
                      <div
                        style={{
                          height: 4,
                          background: 'rgba(255,255,255,0.06)',
                          borderRadius: '100px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: pct === 100 ? '#22c55e' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                            borderRadius: '100px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <p
                        className={inter.className}
                        style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '6px' }}
                      >
                        {completed} / {total} lessons
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/my-courses/${course.slug}`}
                      className={sg.className}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '9px',
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: '8px',
                        color: '#a5b4fc',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        textDecoration: 'none',
                        transition: 'background 0.2s',
                      }}
                    >
                      {pct === 100 ? 'Review Course' : 'Continue Learning'}
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Refunds */}
      {refunds.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <h2
            className={sg.className}
            style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em', marginBottom: '20px' }}
          >
            Refunds
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {refunds.map((r, i) => {
              const done = r.status === 'confirmed';
              return (
                <div
                  key={`${r.courseTitle}-${i}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                    padding: '16px 18px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px',
                  }}
                >
                  <span className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.9375rem' }}>{r.courseTitle || 'Course'}</span>
                  <span
                    className={sg.className}
                    style={{
                      padding: '3px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
                      background: done ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                      border: `1px solid ${done ? 'rgba(74,222,128,0.25)' : 'rgba(251,191,36,0.25)'}`,
                      color: done ? '#4ade80' : '#fbbf24',
                    }}
                  >
                    {done ? 'Refunded' : 'Refund processing'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .dash-content { padding: 24px 16px !important; }
        }
      `}</style>
    </div>
  );
}
