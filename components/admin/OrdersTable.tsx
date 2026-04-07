'use client';

import { useState } from 'react';
import { Space_Grotesk, Inter } from 'next/font/google';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const STATUS_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  failed: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
};

interface OrderRow {
  _id: string;
  student: { name: string; phone: string };
  course: string;
  amount: number;
  currency: string;
  paymentGateway: string;
  transactionId?: string;
  status: string;
  createdAt: string;
}

const FILTERS = ['all', 'pending', 'success', 'failed'] as const;
type Filter = typeof FILTERS[number];

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1200 }} className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: 0 }}>Orders</h1>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            const st = f !== 'all' ? STATUS_STYLE[f] : null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={sg.className}
                style={{
                  padding: '6px 14px', borderRadius: 100, border: active ? (st ? `1px solid ${st.border}` : '1px solid rgba(99,102,241,0.3)') : '1px solid rgba(255,255,255,0.07)',
                  background: active ? (st ? st.bg : 'rgba(99,102,241,0.1)') : 'transparent',
                  color: active ? (st ? st.color : '#a5b4fc') : '#52525b',
                  fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', textTransform: 'capitalize',
                }}
              >{f}</button>
            );
          })}
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Order ID', 'Student', 'Course', 'Amount', 'Gateway', 'Tx ID', 'Status', 'Date'].map((h) => (
                  <th key={h} className={sg.className} style={{ padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className={inter.className} style={{ padding: '48px 16px', textAlign: 'center', color: '#52525b' }}>No orders found</td>
                </tr>
              ) : visible.map((o, i) => {
                const st = STATUS_STYLE[o.status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={o._id} style={{ borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      …{o._id.slice(-8)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <p className={inter.className} style={{ color: '#e2e8f0', fontSize: '0.875rem', margin: 0 }}>{o.student.name}</p>
                      <p className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', margin: 0 }}>{o.student.phone}</p>
                    </td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '0.8125rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.course}</td>
                    <td className={sg.className} style={{ padding: '12px 16px', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>৳{o.amount.toLocaleString()}</td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#71717a', fontSize: '0.8125rem', textTransform: 'uppercase' }}>{o.paymentGateway}</td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', fontFamily: 'monospace', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.transactionId ?? '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={sg.className} style={{ padding: '2px 8px', background: st.bg, border: `1px solid ${st.border}`, borderRadius: '100px', color: st.color, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize' }}>{o.status}</span>
                    </td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}
