'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

interface CourseRow {
  _id: string;
  title: string;
  thumbnail?: string;
  price: number;
  level: string;
  isPublished: boolean;
  slug: string;
}

const LEVEL_COLOR: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#f59e0b',
  advanced: '#f87171',
};

export default function CoursesTable({
  initialCourses,
  canCreate = false,
  canEdit = false,
  canDelete = false,
}: {
  initialCourses: CourseRow[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const [courses, setCourses] = useState(initialCourses);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !current }),
      });
      if (!res.ok) throw new Error();
      setCourses((prev) => prev.map((c) => c._id === id ? { ...c, isPublished: !current } : c));
      toast.success(`Course ${!current ? 'published' : 'unpublished'}`);
    } catch {
      toast.error('Failed to update course');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmId(null);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCourses((prev) => prev.filter((c) => c._id !== id));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }} className="admin-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: 0 }}>Courses</h1>
        {canCreate && (
          <Link
            href="/admin/courses/create"
            className={sg.className}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, color: 'white', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}
          >
            <Plus size={15} />
            Create New Course
          </Link>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Thumbnail', 'Title', 'Price', 'Level', 'Published', 'Actions'].map((h) => (
                  <th key={h} className={sg.className} style={{ padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr><td colSpan={6} className={inter.className} style={{ padding: '48px 16px', textAlign: 'center', color: '#52525b' }}>No courses yet. Create your first one!</td></tr>
              ) : courses.map((c, i) => (
                <tr key={c._id} style={{ borderBottom: i < courses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  {/* Thumbnail */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ width: 56, height: 40, borderRadius: 6, background: c.thumbnail ? `url(${c.thumbnail}) center/cover` : 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(34,211,238,0.1))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                      {!c.thumbnail && '⚡'}
                    </div>
                  </td>
                  {/* Title */}
                  <td className={inter.className} style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: '0.875rem', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                  {/* Price */}
                  <td className={sg.className} style={{ padding: '12px 16px', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {c.price === 0 ? 'Free' : `৳${c.price.toLocaleString()}`}
                  </td>
                  {/* Level */}
                  <td style={{ padding: '12px 16px' }}>
                    <span className={sg.className} style={{ padding: '2px 8px', background: `${LEVEL_COLOR[c.level]}18`, border: `1px solid ${LEVEL_COLOR[c.level]}44`, borderRadius: '100px', color: LEVEL_COLOR[c.level], fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {c.level}
                    </span>
                  </td>
                  {/* Toggle */}
                  <td style={{ padding: '12px 16px' }}>
                    {canEdit ? (
                      <button
                        onClick={() => handleToggle(c._id, c.isPublished)}
                        disabled={togglingId === c._id}
                        title={c.isPublished ? 'Click to unpublish' : 'Click to publish'}
                        style={{
                          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                          background: c.isPublished ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.1)',
                          position: 'relative', transition: 'background 0.2s', opacity: togglingId === c._id ? 0.5 : 1,
                        }}
                      >
                        <span style={{ position: 'absolute', top: 3, left: c.isPublished ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                      </button>
                    ) : (
                      <span className={sg.className} style={{ color: c.isPublished ? '#a5b4fc' : '#52525b', fontSize: '0.6875rem', fontWeight: 700 }}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    )}
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {canEdit && (
                        <Link
                          href={`/admin/courses/${c._id}/edit`}
                          title="Edit"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 7, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#6366f1', textDecoration: 'none' }}
                        >
                          <Edit2 size={14} />
                        </Link>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => setConfirmId(c._id)}
                          disabled={deletingId === c._id}
                          title="Delete"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 7, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', opacity: deletingId === c._id ? 0.5 : 1 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      {!canEdit && !canDelete && <span style={{ color: '#3f3f46', fontSize: '0.75rem' }}>—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {confirmId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: 24 }}>
          <div style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '28px 32px', maxWidth: 380, width: '100%', textAlign: 'center' }}>
            <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.125rem', marginBottom: 8 }}>Delete Course?</p>
            <p className={inter.className} style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setConfirmId(null)} className={inter.className} style={{ padding: '9px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#a1a1aa', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
              <button onClick={() => handleDelete(confirmId)} className={sg.className} style={{ padding: '9px 20px', background: 'linear-gradient(135deg, #dc2626, #ef4444)', border: 'none', borderRadius: 8, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}
