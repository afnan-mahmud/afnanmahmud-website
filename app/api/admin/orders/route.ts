import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import type { ICourse } from '@/models/Course';
import type { IUser } from '@/models/User';
import { requirePerm } from '@/lib/permissions.server';

export async function GET(req: NextRequest) {
  if (!await requirePerm('orders.view')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');

  const query = status && status !== 'all' ? { status } : {};

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

  const orders = await Order.find(query)
    .populate<{ student: IUser }>('student', 'name phone')
    .populate<{ course: ICourse }>('course', 'title')
    .sort({ createdAt: -1 })
    .lean<LeanOrder[]>();

  const result = orders.map((o) => ({
    _id: String(o._id),
    student: { name: (o.student as IUser | null)?.name ?? '—', phone: (o.student as IUser | null)?.phone ?? '—' },
    course: (o.course as ICourse | null)?.title ?? '—',
    amount: o.amount,
    currency: o.currency,
    paymentGateway: o.paymentGateway,
    transactionId: o.transactionId,
    status: o.status,
    createdAt: o.createdAt,
  }));

  return NextResponse.json(result);
}
