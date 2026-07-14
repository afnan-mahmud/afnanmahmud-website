import { connectDB } from '@/lib/db';
import { Refund } from '@/models/Refund';
import RefundsTable, { type RefundRow } from '@/components/admin/RefundsTable';
import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';

const PAGE_SIZE = 20;
const STATUSES = ['requested', 'confirmed', 'rejected'] as const;
type StatusFilter = 'all' | typeof STATUSES[number];

export default async function AdminRefundsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const access = await requirePage('refunds.manage');

  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const status: StatusFilter = STATUSES.includes(statusParam as typeof STATUSES[number])
    ? (statusParam as StatusFilter)
    : 'all';

  await connectDB();

  type LeanRefund = {
    _id: unknown;
    studentName: string;
    phone: string;
    courseTitle: string;
    amount: number;
    purchaseDate: Date;
    status: 'requested' | 'confirmed' | 'rejected';
  };

  const filter = status === 'all' ? {} : { status };
  const [total, raw] = await Promise.all([
    Refund.countDocuments(filter),
    Refund.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<LeanRefund[]>(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const refunds: RefundRow[] = raw.map((r) => ({
    _id: String(r._id),
    studentName: r.studentName,
    phone: r.phone,
    courseTitle: r.courseTitle,
    amount: r.amount,
    purchaseDate: new Date(r.purchaseDate).toISOString(),
    status: r.status,
  }));

  return (
    <RefundsTable
      refunds={refunds}
      status={status}
      canManage={can(access, 'refunds.manage')}
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={PAGE_SIZE}
    />
  );
}
