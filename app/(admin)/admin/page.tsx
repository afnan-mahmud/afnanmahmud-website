import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import { Space_Grotesk, Inter } from 'next/font/google';
import { DollarSign, Users, UserCheck, BookOpen, ShoppingCart } from 'lucide-react';
import type { IUser } from '@/models/User';
import type { ICourse } from '@/models/Course';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  success: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  failed: { color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
};

/** Build a Mongo `createdAt` range from `from`/`to` (YYYY-MM-DD); `to` is inclusive to end-of-day. */
function buildDateRange(from?: string, to?: string): { createdAt: { $gte?: Date; $lte?: Date } } | Record<string, never> {
  const createdAt: { $gte?: Date; $lte?: Date } = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) createdAt.$gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      createdAt.$lte = d;
    }
  }
  return Object.keys(createdAt).length ? { createdAt } : {};
}

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const access = await requirePage('dashboard.view');

  await connectDB();

  const { from, to } = await searchParams;
  const range = buildDateRange(from, to);
  const hasRange = Object.keys(range).length > 0;

  type LeanOrder = {
    _id: unknown;
    student: IUser | null;
    course: ICourse | null;
    amount: number;
    status: string;
    createdAt: Date;
  };

  // Success orders within the (optional) date range drive revenue / students / orders.
  const successFilter = { status: 'success', ...range };

  const [courses, totalUsers, distinctBuyers, orders] = await Promise.all([
    Course.countDocuments(), // catalog count — never date-filtered
    User.countDocuments(range), // every user (purchased or not), by signup date in range
    Order.distinct('student', successFilter), // unique students with a successful purchase
    Order.find(range)
      .sort({ createdAt: -1 })
      .populate<{ student: IUser }>('student', 'name phone')
      .populate<{ course: ICourse }>('course', 'title')
      .lean<LeanOrder[]>(),
  ]);

  const successOrders = orders.filter((o) => o.status === 'success');
  const totalRevenue = successOrders.reduce((s, o) => s + o.amount, 0);
  const totalStudents = distinctBuyers.length;
  const recentOrders = orders.slice(0, 10);

  // Each card is shown only if the viewer can view that card's section, so
  // granting dashboard access never leaks another section's sensitive data.
  const STATS = [
    { perm: 'accounts.view', label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
    { perm: 'students.view', label: 'Total Students', value: totalStudents, icon: UserCheck, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
    { perm: 'students.view', label: 'Total Users', value: totalUsers, icon: Users, color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)' },
    { perm: 'courses.view', label: 'Total Courses', value: courses, icon: BookOpen, color: '#22d3ee', bg: 'rgba(34,211,238,0.07)', border: 'rgba(34,211,238,0.18)' },
    { perm: 'orders.view', label: 'Total Orders', value: successOrders.length, icon: ShoppingCart, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' },
  ].filter((s) => can(access, s.perm));

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#e2e8f0',
    padding: '8px 12px',
    fontSize: '0.8125rem',
    colorScheme: 'dark',
  };

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }} className="admin-content">
      <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', marginBottom: 24 }}>
        Admin Dashboard
      </h1>

      {/* Date range filter */}
      <form method="get" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12, marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="from" className={inter.className} style={{ color: '#71717a', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>From</label>
          <input id="from" type="date" name="from" defaultValue={from ?? ''} className={inter.className} style={inputStyle} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="to" className={inter.className} style={{ color: '#71717a', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>To</label>
          <input id="to" type="date" name="to" defaultValue={to ?? ''} className={inter.className} style={inputStyle} />
        </div>
        <button type="submit" className={sg.className} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}>Apply</button>
        {hasRange && (
          <Link href="/admin" className={sg.className} style={{ color: '#71717a', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none', padding: '9px 4px' }}>Reset</Link>
        )}
        <span className={inter.className} style={{ color: '#52525b', fontSize: '0.75rem', marginLeft: 'auto', alignSelf: 'center' }}>
          {hasRange ? `Showing ${from || '…'} → ${to || '…'}` : 'Showing all time'}
        </span>
      </form>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {STATS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={18} color={color} />
            </div>
            <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{value}</p>
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders — only for viewers who can see orders */}
      {can(access, 'orders.view') && (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Recent Orders</h2>
          <Link href="/admin/orders" className={sg.className} style={{ color: '#6366f1', fontSize: '0.8125rem', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Student', 'Phone', 'Course', 'Amount', 'Status', 'Date'].map((h) => (
                  <th key={h} className={sg.className} style={{ padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className={inter.className} style={{ padding: '32px 16px', textAlign: 'center', color: '#52525b', fontSize: '0.875rem' }}>No orders yet</td></tr>
              ) : recentOrders.map((o, i) => {
                const st = STATUS_STYLE[o.status] ?? STATUS_STYLE.pending;
                return (
                  <tr key={String(o._id)} style={{ borderBottom: i < recentOrders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>{(o.student as IUser | null)?.name ?? '—'}</td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#71717a', fontSize: '0.8125rem' }}>{(o.student as IUser | null)?.phone ?? '—'}</td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#a1a1aa', fontSize: '0.8125rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(o.course as ICourse | null)?.title ?? '—'}</td>
                    <td className={sg.className} style={{ padding: '12px 16px', color: '#a5b4fc', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>৳{o.amount.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={sg.className} style={{ padding: '2px 8px', background: st.bg, borderRadius: '100px', color: st.color, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'capitalize' }}>{o.status}</span>
                    </td>
                    <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <style>{`@media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}
