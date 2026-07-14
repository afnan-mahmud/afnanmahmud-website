'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, X, Loader2, AlertTriangle } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { formatDhakaDate } from '@/lib/date';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

export interface RefundCourse {
  courseId: string;
  title: string;
  amount: number;
  purchaseDate: string;
}

const SEVEN_DAYS = 7 * 24 * 3600 * 1000;

export default function RefundModal({
  student,
  courses,
  onClose,
}: {
  student: { _id: string; name: string; phone: string };
  courses: RefundCourse[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isOld = (iso: string) => Date.now() - new Date(iso).getTime() > SEVEN_DAYS;

  async function submit() {
    setError('');
    if (!selected) { setError('Ekta course select korun'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: student._id, courseId: selected }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Refund request byartho');
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refund request byartho');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: '#121214', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>Refund Course</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2 }}><X size={18} /></button>
        </div>

        <div style={{ padding: 20 }}>
          <p className={inter.className} style={{ color: '#a1a1aa', fontSize: '0.8125rem', margin: '0 0 6px' }}>
            {student.name} · {student.phone}
          </p>
          <p className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', margin: '0 0 16px' }}>
            Course select korle student er kach theke oi course er access shathe shathe chole jabe (pending). Refund menu theke confirm/reject korte hobe.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {courses.map((c) => {
              const old = isOld(c.purchaseDate);
              const active = selected === c.courseId;
              return (
                <label
                  key={c.courseId}
                  className={inter.className}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: active ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <input
                    type="radio"
                    name="refund-course"
                    checked={active}
                    onChange={() => setSelected(c.courseId)}
                    style={{ marginTop: 3, accentColor: '#6366f1' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 600 }}>{c.title}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <span className={sg.className} style={{ color: '#a5b4fc', fontSize: '0.8125rem', fontWeight: 700 }}>৳{c.amount.toLocaleString()}</span>
                      <span style={{ color: '#52525b', fontSize: '0.75rem' }}>Joined {formatDhakaDate(c.purchaseDate)}</span>
                    </div>
                    {old && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '3px 8px', borderRadius: 6, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
                        <AlertTriangle size={12} color="#fbbf24" />
                        <span style={{ color: '#fbbf24', fontSize: '0.6875rem', fontWeight: 600 }}>7 din periye geche</span>
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {error && <p className={inter.className} style={{ color: '#f87171', fontSize: '0.8125rem', margin: '0 0 14px' }}>{error}</p>}

          <button
            onClick={submit}
            disabled={busy}
            className={sg.className}
            style={{
              width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: '#ef4444', color: '#fff', border: 'none',
              borderRadius: 8, padding: '11px', fontSize: '0.9375rem', fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? <Loader2 size={16} className="spin" /> : <RotateCcw size={16} />} Refund Request
          </button>
        </div>
        <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
