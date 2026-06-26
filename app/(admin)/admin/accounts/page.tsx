import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Expense } from '@/models/Expense';
import { ExpenseCategory } from '@/models/ExpenseCategory';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Wallet, Receipt, Landmark } from 'lucide-react';
import type { IUser } from '@/models/User';
import type { ICourse } from '@/models/Course';
import ExpenseButton from '@/components/admin/ExpenseButton';
import Pagination from '@/components/admin/Pagination';
import { formatDhakaDate } from '@/lib/date';
import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const PAGE_SIZE = 20;

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePage('accounts.view');
  const canExpense = can(access, 'accounts.expense');

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  await connectDB();

  type LeanOrder = {
    _id: unknown;
    student: IUser | null;
    course: ICourse | null;
    amount: number;
    createdAt: Date;
  };
  type LeanExpense = {
    _id: unknown;
    category: string;
    subcategory?: string;
    amount: number;
    note?: string;
    createdAt: Date;
  };

  const [successOrders, expenses, categoriesRaw] = await Promise.all([
    Order.find({ status: 'success' })
      .populate<{ student: IUser }>('student', 'name')
      .populate<{ course: ICourse }>('course', 'title')
      .lean<LeanOrder[]>(),
    Expense.find().lean<LeanExpense[]>(),
    ExpenseCategory.find().sort({ name: 1 }).lean(),
  ]);

  const totalOrders = successOrders.reduce((s, o) => s + o.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const mainAccount = totalOrders - totalExpense;

  const categories = categoriesRaw.map((c) => ({
    _id: String(c._id),
    name: c.name,
    subcategories: c.subcategories ?? [],
  }));

  // Build the ledger: course income = credit, expense = debit. Oldest → newest with running balance.
  type Entry = { id: string; date: Date; particulars: string; credit: number; debit: number };
  const entries: Entry[] = [
    ...successOrders.map((o) => ({
      id: String(o._id),
      date: new Date(o.createdAt),
      particulars: `Course purchase — ${(o.course as ICourse | null)?.title ?? 'Unknown course'}${(o.student as IUser | null)?.name ? ` (${(o.student as IUser).name})` : ''}`,
      credit: o.amount,
      debit: 0,
    })),
    ...expenses.map((e) => ({
      id: String(e._id),
      date: new Date(e.createdAt),
      particulars: `Expense — ${e.category}${e.subcategory ? ` / ${e.subcategory}` : ''}${e.note ? ` · ${e.note}` : ''}`,
      credit: 0,
      debit: e.amount,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Balance accumulates oldest → newest, then we display newest first.
  const ledger = entries.reduce<Array<Entry & { balance: number }>>((acc, e) => {
      const prev = acc.length ? acc[acc.length - 1].balance : 0;
      acc.push({ ...e, balance: prev + e.credit - e.debit });
      return acc;
    }, [])
    .reverse();

  // Totals/running balance are computed across all transactions; only the
  // current page's rows are rendered.
  const total = ledger.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedLedger = ledger.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const BOXES = [
    { label: 'Total Order', value: totalOrders, icon: Wallet, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)' },
    { label: 'Expense', value: totalExpense, icon: Receipt, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
    { label: 'Main Account', value: mainAccount, icon: Landmark, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
  ];

  const th: React.CSSProperties = { padding: '10px 16px', textAlign: 'left', color: '#52525b', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' };

  return (
    <div style={{ padding: '36px 32px', maxWidth: 1100 }} className="admin-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <h1 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', letterSpacing: '-0.02em', margin: 0 }}>Accounts</h1>
        {canExpense && <ExpenseButton categories={categories} />}
      </div>

      {/* Summary boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 40 }}>
        {BOXES.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Icon size={18} color={color} />
            </div>
            <p className={sg.className} style={{ color: '#f1f5f9', fontWeight: 800, fontSize: '1.625rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}>৳{value.toLocaleString()}</p>
            <p className={inter.className} style={{ color: '#52525b', fontSize: '0.8125rem', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Account summary ledger */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem', margin: 0 }}>Account Summary</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th style={th}>Date</th>
                <th style={th}>Particulars</th>
                <th style={{ ...th, textAlign: 'right' }}>Credit</th>
                <th style={{ ...th, textAlign: 'right' }}>Debit</th>
                <th style={{ ...th, textAlign: 'right' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {pagedLedger.length === 0 ? (
                <tr><td colSpan={5} className={inter.className} style={{ padding: '40px 16px', textAlign: 'center', color: '#52525b', fontSize: '0.875rem' }}>No transactions yet</td></tr>
              ) : pagedLedger.map((e, i) => (
                <tr key={e.id} style={{ borderBottom: i < pagedLedger.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td className={inter.className} style={{ padding: '12px 16px', color: '#52525b', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatDhakaDate(e.date)}
                  </td>
                  <td className={inter.className} style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: '0.8125rem' }}>{e.particulars}</td>
                  <td className={sg.className} style={{ padding: '12px 16px', textAlign: 'right', color: e.credit ? '#4ade80' : '#3f3f46', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{e.credit ? `৳${e.credit.toLocaleString()}` : '—'}</td>
                  <td className={sg.className} style={{ padding: '12px 16px', textAlign: 'right', color: e.debit ? '#f87171' : '#3f3f46', fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{e.debit ? `৳${e.debit.toLocaleString()}` : '—'}</td>
                  <td className={sg.className} style={{ padding: '12px 16px', textAlign: 'right', color: e.balance < 0 ? '#f87171' : '#a5b4fc', fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap' }}>৳{e.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={totalPages} basePath="/admin/accounts" total={total} pageSize={PAGE_SIZE} />
      </div>

      <style>{`@media (max-width: 640px) { .admin-content { padding: 20px 16px !important; } }`}</style>
    </div>
  );
}
