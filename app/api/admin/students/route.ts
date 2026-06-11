import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course, type ICourse } from '@/models/Course';
import { Order } from '@/models/Order';
import { sendPurchaseConfirmation } from '@/lib/sms';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();

  type LeanUser = {
    _id: unknown;
    name: string;
    phone: string;
    avatar?: string;
    purchasedCourses: ICourse[];
    createdAt: Date;
  };

  const users = await User.find({ role: 'student' })
    .populate<{ purchasedCourses: ICourse[] }>('purchasedCourses', 'title slug')
    .sort({ createdAt: -1 })
    .lean<LeanUser[]>();

  const result = users.map((u) => ({
    _id: String(u._id),
    name: u.name,
    phone: u.phone,
    avatar: u.avatar,
    enrolledCount: (u.purchasedCourses as ICourse[]).length,
    enrolledCourses: (u.purchasedCourses as ICourse[]).map((c) => ({ title: c.title, slug: c.slug })),
    createdAt: u.createdAt,
  }));

  return NextResponse.json(result);
}

// Manually enroll a student into a course (free or partial-payment).
// amount > 0 records a `success` Order, which flows into the accounts ledger
// as credit. amount === 0 enrolls without any Order (no ledger entry).
export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json()) as { name?: string; phone?: string; courseId?: string; amount?: number };
  const name = body.name?.trim();
  const courseId = body.courseId;
  const amount = Number(body.amount ?? 0);

  if (!name) {
    return NextResponse.json({ error: 'Name din' }, { status: 400 });
  }
  const normalised = (body.phone ?? '').replace(/[\s\-]/g, '').replace(/^\+?880/, '0');
  if (!/^01[3-9]\d{8}$/.test(normalised)) {
    return NextResponse.json({ error: 'Sothik phone number din (01XXXXXXXXX)' }, { status: 400 });
  }
  if (!courseId) {
    return NextResponse.json({ error: 'Course select korun' }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount < 0) {
    return NextResponse.json({ error: 'Sothik amount din (0 ba beshi)' }, { status: 400 });
  }

  await connectDB();

  const course = await Course.findById(courseId);
  if (!course) {
    return NextResponse.json({ error: 'Course paoa jayni' }, { status: 404 });
  }

  // Find or create the student. Per design, an existing user's name is not overwritten.
  let user = await User.findOne({ phone: normalised });
  if (!user) {
    user = await User.create({ name, phone: normalised, role: 'student' });
  }

  const alreadyEnrolled = user.purchasedCourses.some(
    (id: unknown) => String(id) === String(course._id)
  );
  if (alreadyEnrolled) {
    return NextResponse.json({ error: 'Ei student already ei course-e enrolled' }, { status: 409 });
  }

  user.purchasedCourses.push(course._id);
  await user.save();

  course.enrolledCount = (course.enrolledCount ?? 0) + 1;
  await course.save();

  // Record paid manual enrollments as a successful order so the accounts
  // ledger picks them up as credit. Free (0) enrollments create no order.
  if (amount > 0) {
    await Order.create({
      student: user._id,
      course: course._id,
      amount,
      currency: 'BDT',
      paymentGateway: 'manual',
      transactionId: `MANUAL-${Date.now()}`,
      status: 'success',
    });
  }

  // Confirmation SMS — fire-and-forget; never fail the request on SMS error.
  sendPurchaseConfirmation(normalised, course.title).catch(() => {});

  return NextResponse.json({ success: true });
}
