import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { Refund } from '@/models/Refund';
import { auth } from '@/lib/auth';
import { requirePerm } from '@/lib/permissions.server';

export async function POST(req: NextRequest) {
  if (!(await requirePerm('students.refund'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as { studentId?: string; courseId?: string };
  const { studentId, courseId } = body;
  if (!studentId || !courseId) {
    return NextResponse.json({ error: 'studentId ar courseId din' }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(studentId);
  if (!user) return NextResponse.json({ error: 'Student paoa jayni' }, { status: 404 });

  const owns = user.purchasedCourses.some((id: unknown) => String(id) === String(courseId));
  if (!owns) {
    return NextResponse.json({ error: 'Student ei course-e enrolled na' }, { status: 409 });
  }

  const existing = await Refund.findOne({ student: studentId, course: courseId, status: 'requested' });
  if (existing) {
    return NextResponse.json({ error: 'Ei course-er refund already requested' }, { status: 409 });
  }

  const course = await Course.findById(courseId).lean<{ title: string }>();

  // Source amount + purchase date from the paid order (may not exist for free/0 enrollments).
  const order = await Order.findOne({ student: studentId, course: courseId, status: 'success' })
    .sort({ createdAt: -1 });

  await Refund.create({
    student: user._id,
    course: courseId,
    order: order?._id,
    amount: order?.amount ?? 0,
    studentName: user.name,
    phone: user.phone,
    courseTitle: course?.title ?? '',
    purchaseDate: order?.createdAt ?? user.createdAt,
    status: 'requested',
    requestedBy: adminId,
  });

  // Revoke access immediately (pending).
  user.purchasedCourses = user.purchasedCourses.filter(
    (id: unknown) => String(id) !== String(courseId)
  );
  await user.save();

  await Course.updateOne({ _id: courseId, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } });

  return NextResponse.json({ success: true }, { status: 201 });
}
