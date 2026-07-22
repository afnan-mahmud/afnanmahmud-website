'use client';

import { useState, type CSSProperties } from 'react';
import { Eye, StickyNote, MessageCircle } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import Avatar from './Avatar';
import Pagination from './Pagination';
import StudentActivityModal, { type ActivityFocus } from './StudentActivityModal';
import { formatDhakaDate } from '@/lib/date';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export interface AbandonedRow {
  _id: string;
  name: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  /** Payment attempts (orders) this student started. */
  attempts: number;
  /** Call notes logged against this student. */
  notes: number;
}

const ACTION_BTN: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 9px',
  borderRadius: 7,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#a1a1aa',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export default function AbandonedStudentsTable({
  students,
  page = 1,
  totalPages = 1,
  total,
  pageSize,
  basePath = '/admin/abandoned-students',
  canNote,
  canWhatsApp,
}: {
  students: AbandonedRow[];
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  basePath?: string;
  canNote: boolean;
  canWhatsApp: boolean;
}) {
  /** The open details view, and which panel the clicked button wants focused. */
  const [open, setOpen] = useState<{ id: string; focus: ActivityFocus } | null>(null);

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }} className="admin-content">
      <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: '0 0 28px' }}>
        Abandoned Students
      </h1>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Actions', 'Name', 'Phone', 'Attempts', 'Joined'].map((h) => (
                  <th key={h} className={sg.className} style={{ padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={5} className={inter.className} style={{ padding: '48px 16px', textAlign: 'center', color: '#52525b' }}>No abandoned students</td></tr>
              ) : students.map((s, i) => (
                <tr key={s._id} style={{ borderBottom: i === students.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button onClick={() => setOpen({ id: s._id, focus: 'details' })} className={sg.className} title="View details" style={ACTION_BTN}>
                        <Eye size={13} /> Details
                      </button>
                      <button onClick={() => setOpen({ id: s._id, focus: 'notes' })} className={sg.className} title="Call notes" style={ACTION_BTN}>
                        <StickyNote size={13} /> Notes{s.notes > 0 ? ` (${s.notes})` : ''}
                      </button>
                      <button
                        onClick={() => setOpen({ id: s._id, focus: 'whatsapp' })}
                        className={sg.className}
                        title="Send WhatsApp message"
                        style={{ ...ACTION_BTN, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={s.name} avatar={s.avatar} />
                      <span className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{s.name}</span>
                    </div>
                  </td>
                  <td className={inter.className} style={{ padding: '12px 16px', color: '#71717a', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{s.phone}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={sg.className} style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '0.6875rem', fontWeight: 700, whiteSpace: 'nowrap', ...(s.attempts > 0
                      ? { background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#52525b' }) }}>
                      {s.attempts} tries
                    </span>
                  </td>
                  <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatDhakaDate(s.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} basePath={basePath} total={total} pageSize={pageSize} />
      </div>

      {open && (
        <StudentActivityModal
          key={`${open.id}-${open.focus}`}
          studentId={open.id}
          focus={open.focus}
          canNote={canNote}
          canWhatsApp={canWhatsApp}
          onClose={() => setOpen(null)}
        />
      )}

      <style>{`@media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}
