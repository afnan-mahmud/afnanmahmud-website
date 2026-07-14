'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, X, Loader2, AlertTriangle } from 'lucide-react';
import { Space_Grotesk, Inter } from 'next/font/google';
import Pagination from './Pagination';
import { formatDhakaDate } from '@/lib/date';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  requested: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  confirmed: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  rejected: { color: '#a1a1aa', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.12)' },
};

const FILTERS = ['all', 'requested', 'confirmed', 'rejected'] as const;
type Filter = typeof FILTERS[number];

export interface RefundRow {
  _id: string;
  studentName: string;
  phone: string;
  courseTitle: string;
  amount: number;
  purchaseDate: string;
  status: 'requested' | 'confirmed' | 'rejected';
}

const SEVEN_DAYS = 7 * 24 * 3600 * 1000;

export default function RefundsTable({
  refunds,
  status = 'all',
  canManage = false,
  page = 1,
  totalPages = 1,
  total,
  pageSize,
}: {
  refunds: RefundRow[];
  status?: Filter;
  canManage?: boolean;
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isOld = (iso: string) => Date.now() - new Date(iso).getTime() > SEVEN_DAYS;

  async function resolve(id: string, action: 'confirm' | 'reject') {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch(`/api/admin/refunds/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Byartho');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Byartho');
    } finally {
      setBusyId(null);
    }
  }

  const colCount = 7;

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1200 }} className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: 0 }}>Refunds</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map((f) => {
            const active = status === f;
            const st = f !== 'all' ? STATUS_STYLE[f] : null;
            return (
              <Link
                key={f}
                href={f === 'all' ? '/admin/refunds' : `/admin/refunds?status=${f}`}
                className={sg.className}
                style={{
                  padding: '6px 14px', borderRadius: 100, textDecoration: 'none',
                  border: active ? (st ? `1px solid ${st.border}` : '1px solid rgba(99,102,241,0.3)') : '1px solid rgba(255,255,255,0.07)',
                  background: active ? (st ? st.bg : 'rgba(99,102,241,0.1)') : 'transparent',
                  color: active ? (st ? st.color : '#a5b4fc') : '#52525b',
                  fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize',
                }}
              >{f}</Link>
            );
          })}
        </div>
      </div>

      {error && <p className={inter.className} style={{ color: '#f87171', fontSize: '0.8125rem', margin: '0 0 14px' }}>{error}</p>}

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Student', 'Phone', 'Course', 'Amount', 'Purchase date', 'Status', ''].map((h, hi) => (
                  <th key={h || `col-${hi}`} className={sg.className} style={{ padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {refunds.length === 0 ? (
                <tr><td colSpan={colCount} className={inter.className} style={{ padding: '48px 16px', textAlign: 'center', color: '#52525b' }}>No refunds found</td></tr>
              ) : refunds.map((r, i) => {
                const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.requested;
                const old = r.status === 'requested' && isOld(r.purchaseDate);
                return (
                  <tr key={r._id} style={{ borderBottom: i < refunds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: '0.875rem' }}>{r.studentName || '—'}</td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#71717a', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{r.phone || '—'}</td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '0.8125rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.courseTitle || '—'}</td>
                    <td className={sg.className} style={{ padding: '12px 16px', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>৳{r.amount.toLocaleString()}</td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {formatDhakaDate(r.purchaseDate)}
                        {old && (
                          <span title="Purchase 7 diner beshi purono" style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 5, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24', fontWeight: 700 }}>
                            <AlertTriangle size={10} /> 7d+
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={sg.className} style={{ padding: '2px 8px', background: st.bg, border: `1px solid ${st.border}`, borderRadius: '100px', color: st.color, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize' }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                      {canManage && r.status === 'requested' && (
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button
                            onClick={() => resolve(r._id, 'confirm')}
                            disabled={busyId === r._id}
                            className={sg.className}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '0.75rem', fontWeight: 700, cursor: busyId === r._id ? 'not-allowed' : 'pointer' }}
                          >
                            {busyId === r._id ? <Loader2 size={13} className="spin" /> : <Check size={13} />} Confirm
                          </button>
                          <button
                            onClick={() => resolve(r._id, 'reject')}
                            disabled={busyId === r._id}
                            className={sg.className}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 700, cursor: busyId === r._id ? 'not-allowed' : 'pointer' }}
                          >
                            <X size={13} /> Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/admin/refunds"
          total={total}
          pageSize={pageSize}
          extraParams={{ status: status === 'all' ? undefined : status }}
        />
      </div>
      <style>{`.spin { animation: spin 0.8s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}
