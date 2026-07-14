import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { Refund } from '@/models/Refund';
import { auth } from '@/lib/auth';
import { requirePerm } from '@/lib/permissions.server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('refunds.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action } = (await req.json()) as { action?: 'confirm' | 'reject' };
  if (action !== 'confirm' && action !== 'reject') {
    return NextResponse.json({ error: 'action confirm ba reject hote hobe' }, { status: 400 });
  }

  await connectDB();

  const refund = await Refund.findById(id);
  if (!refund) return NextResponse.json({ error: 'Refund paoa jayni' }, { status: 404 });
  if (refund.status !== 'requested') {
    return NextResponse.json({ error: 'Ei refund already resolved' }, { status: 409 });
  }

  if (action === 'confirm') {
    refund.status = 'confirmed';
    if (refund.order) {
      await Order.updateOne({ _id: refund.order }, { $set: { status: 'refunded' } });
    }
  } else {
    refund.status = 'rejected';
    // Restore access (guard against duplicate push).
    await User.updateOne(
      { _id: refund.student, purchasedCourses: { $ne: refund.course } },
      { $push: { purchasedCourses: refund.course } }
    );
    await Course.updateOne({ _id: refund.course }, { $inc: { enrolledCount: 1 } });
  }
  refund.resolvedBy = adminId;
  refund.resolvedAt = new Date();
  await refund.save();

  return NextResponse.json({ success: true });
}
