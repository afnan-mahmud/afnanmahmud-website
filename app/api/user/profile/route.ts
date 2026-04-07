import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import type { ICourse } from '@/models/Course';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select('name phone avatar')
      .lean<{ name: string; phone: string; avatar?: string }>();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const orders = await Order.find({ student: session.user.id })
      .sort({ createdAt: -1 })
      .populate<{ course: ICourse }>('course', 'title')
      .lean<Array<{
        _id: unknown;
        course: ICourse | null;
        amount: number;
        currency: string;
        status: string;
        createdAt: Date;
      }>>();

    const formattedOrders = orders.map((o) => ({
      _id: String(o._id),
      courseTitle: (o.course as ICourse | null)?.title ?? 'Deleted Course',
      amount: o.amount,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt,
    }));

    return NextResponse.json({ ...user, orders: formattedOrders });
  } catch (err) {
    console.error('[user/profile GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const name = (body.name as string | undefined)?.trim();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectDB();

    await User.findByIdAndUpdate(session.user.id, { name });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[user/profile PATCH]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
