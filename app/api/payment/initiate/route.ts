import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { initiatePayment } from '@/lib/eps';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, courseSlug } = body as { courseId: string; courseSlug: string };

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already purchased
    const alreadyPurchased = user.purchasedCourses.some(
      (id: unknown) => String(id) === courseId
    );
    if (alreadyPurchased) {
      return NextResponse.json({ alreadyPurchased: true });
    }

    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // If free course, add directly
    if (course.isFree) {
      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { purchasedCourses: course._id },
      });
      await Course.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });
      return NextResponse.json({ alreadyPurchased: true });
    }

    const order = await Order.create({
      student: session.user.id,
      course: course._id,
      amount: course.price,
      currency: 'BDT',
      paymentGateway: 'eps',
      status: 'pending',
    });

    const slug = courseSlug ?? course.slug;
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

    const { paymentUrl } = await initiatePayment({
      amount: course.price,
      currency: 'BDT',
      order_id: order._id.toString(),
      success_url: `${baseUrl}/api/payment/success?orderId=${order._id}`,
      fail_url: `${baseUrl}/api/payment/fail?orderId=${order._id}`,
      cancel_url: process.env.EPS_CANCEL_URL ?? `${baseUrl}/courses/${slug}`,
      customer_name: user.name,
      customer_phone: user.phone,
      product_name: course.title,
    });

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('[payment/initiate]', err);
    return NextResponse.json(
      { error: 'Payment initiation failed. Please try again.' },
      { status: 500 }
    );
  }
}
