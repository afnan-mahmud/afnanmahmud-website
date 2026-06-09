'use client';

import { useState, useCallback } from 'react';
import { CheckCircle, Play, ChevronRight, ChevronDown, BookOpen, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Space_Grotesk, Inter } from 'next/font/google';
import type { ISection, ILesson } from '@/models/Course';
import LessonNote from './LessonNote';
import VdoPlayer from '@/components/VdoPlayer';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface VideoPlayerProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  curriculum: ISection[];
  initialCompleted: string[];
}

function flatLessons(curriculum: ISection[]): ILesson[] {
  return curriculum.flatMap((s) => s.lessons);
}

function getNextLesson(curriculum: ISection[], currentId: string): ILesson | null {
  const all = flatLessons(curriculum);
  const idx = all.findIndex((l) => l._id === currentId);
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
}

export default function VideoPlayer({
  courseId,
  curriculum,
  courseTitle,
  initialCompleted,
}: VideoPlayerProps) {
  const allLessons = flatLessons(curriculum);
  const [activeLesson, setActiveLesson] = useState<ILesson>(allLessons[0]);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(initialCompleted)
  );
  const [marking, setMarking] = useState(false);
  const [openSections, setOpenSections] = useState<Set<number>>(
    new Set(curriculum.map((_, i) => i))
  );

  const total = allLessons.length;
  const completedCount = completedLessons.size;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const toggleSection = (i: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(i)) { next.delete(i); } else { next.add(i); }
      return next;
    });
  };

  const handleMarkComplete = useCallback(async () => {
    if (!activeLesson || completedLessons.has(activeLesson._id)) return;

    // Optimistic update
    setCompletedLessons((prev) => new Set([...prev, activeLesson._id]));
    setMarking(true);

    try {
      const res = await fetch(`/api/progress/${courseId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: activeLesson._id }),
      });

      if (!res.ok) throw new Error('Failed to save progress');
      toast.success('Lesson marked as complete!');
    } catch {
      // Rollback optimistic update on failure
      setCompletedLessons((prev) => {
        const next = new Set(prev);
        next.delete(activeLesson._id);
        return next;
      });
      toast.error('Could not save progress. Try again.');
    } finally {
      setMarking(false);
    }
  }, [activeLesson, completedLessons, courseId]);

  const nextLesson = activeLesson ? getNextLesson(curriculum, activeLesson._id) : null;
  const isCompleted = activeLesson ? completedLessons.has(activeLesson._id) : false;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '30% 70%',
        height: 'calc(100vh - 64px)',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
      className="player-grid"
    >
      {/* ── LEFT SIDEBAR: Curriculum ── */}
      <div
        className="player-sidebar"
        style={{
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Course title */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <h2
            className={sg.className}
            style={{
              color: '#f1f5f9',
              fontWeight: 700,
              fontSize: '0.9375rem',
              lineHeight: 1.4,
              marginBottom: '12px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {courseTitle}
          </h2>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: pct === 100 ? '#22c55e' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  borderRadius: '100px',
                  transition: 'width 0.4s',
                }}
              />
            </div>
            <span className={sg.className} style={{ color: pct === 100 ? '#4ade80' : '#a5b4fc', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
              {pct}%
            </span>
          </div>
          <p className={inter.className} style={{ color: '#52525b', fontSize: '0.6875rem', marginTop: '4px' }}>
            {completedCount} of {total} lessons
          </p>
        </div>

        {/* Lesson list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {curriculum.map((section, si) => (
            <div key={si}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(si)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <BookOpen size={13} color="#52525b" style={{ flexShrink: 0 }} />
                <span
                  className={sg.className}
                  style={{
                    color: '#71717a',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {section.sectionTitle}
                </span>
                {openSections.has(si)
                  ? <ChevronDown size={13} color="#52525b" style={{ flexShrink: 0 }} />
                  : <ChevronRight size={13} color="#52525b" style={{ flexShrink: 0 }} />
                }
              </button>

              {/* Lessons */}
              {openSections.has(si) && section.lessons.map((lesson) => {
                const isActive = activeLesson?._id === lesson._id;
                const isDone = completedLessons.has(lesson._id);
                return (
                  <button
                    key={lesson._id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 16px 9px 28px',
                      background: isActive ? 'rgba(99,102,241,0.1)' : 'none',
                      borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                  >
                    {isDone ? (
                      <CheckCircle size={14} color="#22c55e" style={{ flexShrink: 0 }} />
                    ) : (
                      <Play size={12} color={isActive ? '#6366f1' : '#3f3f46'} fill={isActive ? '#6366f1' : 'none'} style={{ flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className={inter.className}
                        style={{
                          color: isActive ? '#e2e8f0' : isDone ? '#71717a' : '#a1a1aa',
                          fontSize: '0.8125rem',
                          fontWeight: isActive ? 500 : 400,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {lesson.title}
                      </p>
                      {lesson.duration && (
                        <p className={inter.className} style={{ color: '#3f3f46', fontSize: '0.6875rem', margin: 0 }}>
                          {lesson.duration}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Video + controls ── */}
      <div className="player-main" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Video */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', flexShrink: 0 }}>
          {activeLesson?.videoId ? (
            <VdoPlayer key={activeLesson._id} videoId={activeLesson.videoId} title={activeLesson.title} />
          ) : (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <Play size={48} color="#3f3f46" />
              <p className={inter.className} style={{ color: '#3f3f46', marginTop: '12px', fontSize: '0.875rem' }}>
                Select a lesson to start watching
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ padding: '24px 28px', flex: 1, overflowY: 'auto' }} className="player-controls">
          <h2
            className={sg.className}
            style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.01em', marginBottom: '20px' }}
          >
            {activeLesson?.title ?? 'Select a lesson'}
          </h2>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {isCompleted ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 20px',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: '8px',
                  color: '#4ade80',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  fontFamily: sg.style.fontFamily,
                }}
              >
                <CheckCircle size={15} />
                Completed ✓
              </div>
            ) : (
              <button
                onClick={handleMarkComplete}
                disabled={marking || !activeLesson?.videoId}
                className={sg.className}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 20px',
                  background: marking ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: marking ? 'not-allowed' : 'pointer',
                  transition: 'opacity 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                <CheckCircle size={15} />
                {marking ? 'Saving…' : 'Mark as Complete'}
              </button>
            )}

            {nextLesson && (
              <button
                onClick={() => setActiveLesson(nextLesson)}
                className={sg.className}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1.5px solid rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  color: '#a1a1aa',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#a5b4fc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#a1a1aa'; }}
              >
                Next Lesson
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Lesson notes (admin-authored, enrolled students only) */}
          {activeLesson?.note?.trim() && (
            <div
              style={{
                marginTop: 28,
                padding: '20px 22px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <FileText size={16} color="#a5b4fc" />
                <h3 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem', margin: 0, letterSpacing: '-0.01em' }}>
                  Lesson Notes
                </h3>
              </div>
              <LessonNote note={activeLesson.note} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .player-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            overflow: visible !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .player-sidebar {
            order: 2;
            max-height: 400px;
            overflow-y: auto;
            border-right: none !important;
            border-top: 1px solid rgba(255,255,255,0.06);
          }
          .player-main {
            order: 1;
          }
          .player-controls {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
