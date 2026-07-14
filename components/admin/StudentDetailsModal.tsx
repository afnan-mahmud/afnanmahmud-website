'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, BookOpen, CheckCircle, CreditCard } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import { formatDhakaDate } from '@/lib/date';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

type RefundStatus = 'requested' | 'confirmed' | 'rejected';

interface CourseDetail {
  title: string;
  slug: string;
  joinDate: string;
  completed: number;
  total: number;
  amountPaid: number;
  transactionId: string | null;
  paymentGateway: string | null;
  refundStatus: RefundStatus | null;
}

interface DetailsData {
  student: { name: string; phone: string; createdAt: string };
  courses: CourseDetail[];
}

const REFUND_BADGE: Record<RefundStatus, { label: string; color: string; bg: string; border: string }> = {
  requested: { label: 'Refund requested', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  confirmed: { label: 'Refunded', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  rejected: { label: 'Refund rejected', color: '#a1a1aa', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)' },
};

export default function StudentDetailsModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [data, setData] = useState<DetailsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/students/${studentId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d: DetailsData) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) setError('Details load hoyni'); });
    return () => { cancelled = true; };
  }, [studentId]);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 560, background: '#121214', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>Student Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: 2 }}><X size={18} /></button>
        </div>

        <div style={{ padding: 20 }}>
          {!data && !error && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
              <Loader2 size={24} color="#6366f1" className="spin" />
            </div>
          )}
          {error && <p className={inter.className} style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center', padding: '30px 0' }}>{error}</p>}

          {data && (
            <>
              <div style={{ marginBottom: 20 }}>
                <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', margin: '0 0 2px' }}>{data.student.name}</p>
                <p className={inter.className} style={{ color: '#71717a', fontSize: '0.8125rem', margin: 0 }}>{data.student.phone}</p>
                <p className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', margin: '4px 0 0' }}>Account created {formatDhakaDate(data.student.createdAt)}</p>
              </div>

              {data.courses.length === 0 ? (
                <p className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No active courses</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.courses.map((c) => {
                    const pct = c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0;
                    const badge = c.refundStatus ? REFUND_BADGE[c.refundStatus] : null;
                    return (
                      <div key={c.slug} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                          <span className={sg.className} style={{ color: '#e2e8f0', fontSize: '0.9375rem', fontWeight: 700 }}>{c.title}</span>
                          {badge && (
                            <span className={inter.className} style={{ padding: '2px 8px', borderRadius: '100px', background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color, fontSize: '0.6875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{badge.label}</span>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <BookOpen size={14} color="#6366f1" />
                            <span className={inter.className} style={{ color: '#a1a1aa', fontSize: '0.8125rem' }}>Joined {formatDhakaDate(c.joinDate)}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <CheckCircle size={14} color="#22d3ee" />
                            <span className={inter.className} style={{ color: '#a1a1aa', fontSize: '0.8125rem' }}>{c.completed} / {c.total} lessons ({pct}%)</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <CreditCard size={14} color="#a78bfa" />
                            <span className={inter.className} style={{ color: '#a1a1aa', fontSize: '0.8125rem' }}>
                              ৳{c.amountPaid.toLocaleString()}{c.paymentGateway ? ` · ${c.paymentGateway}` : ''}
                            </span>
                          </div>
                        </div>
                        {c.transactionId && (
                          <p className={inter.className} style={{ color: '#52525b', fontSize: '0.6875rem', margin: '8px 0 0' }}>Txn: {c.transactionId}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
