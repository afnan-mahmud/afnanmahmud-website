import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import type { IUser } from '@/models/User';
import type { ICourse } from '@/models/Course';
import OrdersTable from '@/components/admin/OrdersTable';
import { requirePage } from '@/lib/permissions.server';

const PAGE_SIZE = 20;
const STATUSES = ['pending', 'success', 'failed'] as const;
type StatusFilter = 'all' | typeof STATUSES[number];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  await requirePage('orders.view');

  const { page: pageParam, status: statusParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const status: StatusFilter = STATUSES.includes(statusParam as typeof STATUSES[number])
    ? (statusParam as StatusFilter)
    : 'all';

  await connectDB();
  type LeanOrder = {
    _id: unknown;
    student: IUser | null;
    course: ICourse | null;
    amount: number;
    currency: string;
    paymentGateway: string;
    transactionId?: string;
    status: string;
    createdAt: Date;
  };

  const filter = status === 'all' ? {} : { status };
  const [total, raw] = await Promise.all([
    Order.countDocuments(filter),
    Order.find(filter)
      .populate<{ student: IUser }>('student', 'name phone')
      .populate<{ course: ICourse }>('course', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<LeanOrder[]>(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const orders = raw.map((o) => ({
    _id: String(o._id),
    student: {
      name: (o.student as IUser | null)?.name ?? '—',
      phone: (o.student as IUser | null)?.phone ?? '—',
    },
    course: (o.course as ICourse | null)?.title ?? '—',
    amount: o.amount,
    currency: o.currency,
    paymentGateway: o.paymentGateway,
    transactionId: o.transactionId,
    status: o.status,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <OrdersTable
      orders={orders}
      status={status}
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={PAGE_SIZE}
    />
  );
}
