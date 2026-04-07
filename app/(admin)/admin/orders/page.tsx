import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import type { IUser } from '@/models/User';
import type { ICourse } from '@/models/Course';
import OrdersTable from '@/components/admin/OrdersTable';

export default async function AdminOrdersPage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/dashboard');

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

  const raw = await Order.find()
    .populate<{ student: IUser }>('student', 'name phone')
    .populate<{ course: ICourse }>('course', 'title')
    .sort({ createdAt: -1 })
    .lean<LeanOrder[]>();

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

  return <OrdersTable orders={orders} />;
}
