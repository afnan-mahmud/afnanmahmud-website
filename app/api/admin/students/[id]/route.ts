import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User, type IProgress } from '@/models/User';
import { Course, type ICourse } from '@/models/Course';
import { Order } from '@/models/Order';
import { Refund } from '@/models/Refund';
import { requirePerm } from '@/lib/permissions.server';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('students.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();
  void Course; // ensure the Course model is registered for populate()

  const user = await User.findById(id)
    .populate<{ purchasedCourses: ICourse[] }>('purchasedCourses')
    .lean<{ name: string; phone: string; createdAt: Date; purchasedCourses: ICourse[]; progress: IProgress[] }>();
  if (!user) return NextResponse.json({ error: 'Student paoa jayni' }, { status: 404 });

  const orders = await Order.find({ student: id })
    .select('course amount transactionId paymentGateway status createdAt')
    .lean<{ course: unknown; amount: number; transactionId?: string; paymentGateway?: string; status: string; createdAt: Date }[]>();
  const refunds = await Refund.find({ student: id })
    .select('course status')
    .lean<{ course: unknown; status: string }[]>();

  const totalLessons = (c: ICourse) => c.curriculum.reduce((s, sec) => s + sec.lessons.length, 0);
  const completedFor = (cid: unknown) =>
    (user.progress ?? []).find((p) => String(p.courseId) === String(cid))?.completedLessons?.length ?? 0;

  const courses = (user.purchasedCourses ?? []).map((c) => {
    const ord = orders
      .filter((o) => String(o.course) === String(c._id) && o.status === 'success')
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    const rf = refunds.find((r) => String(r.course) === String(c._id));
    return {
      title: c.title,
      slug: c.slug,
      joinDate: new Date(ord?.createdAt ?? user.createdAt).toISOString(),
      completed: completedFor(c._id),
      total: totalLessons(c),
      amountPaid: ord?.amount ?? 0,
      transactionId: ord?.transactionId ?? null,
      paymentGateway: ord?.paymentGateway ?? null,
      refundStatus: rf?.status ?? null,
    };
  });

  return NextResponse.json({
    student: { name: user.name, phone: user.phone, createdAt: new Date(user.createdAt).toISOString() },
    courses,
  });
}
