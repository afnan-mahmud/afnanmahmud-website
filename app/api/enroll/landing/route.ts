import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { initiatePayment, newMerchantTransactionId, epsConfigured } from '@/lib/eps';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, capiSignalsFromRequest } from '@/lib/meta-capi';

const DEFAULT_COURSE_SLUG = 'complete-website-and-mobile-application-development-course-by-ai';
// Slugs the landing-enroll flow is allowed to enroll into.
const ALLOWED_SLUGS = new Set([
  DEFAULT_COURSE_SLUG,
  'ai-for-developers',
]);
const isDev = process.env.NODE_ENV !== 'production';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { name?: string; phone?: string; slug?: string };
    const { name, phone } = body;

    const COURSE_SLUG = body.slug && ALLOWED_SLUGS.has(body.slug) ? body.slug : DEFAULT_COURSE_SLUG;

    if (!name || !phone) {
      return NextResponse.json({ error: 'আপনার নাম ও ফোন নম্বর দিতে হবে।' }, { status: 400 });
    }

    // Normalise phone: strip spaces/dashes, ensure starts with 01
    const normalised = phone.replace(/[\s\-]/g, '').replace(/^\+?880/, '0');
    if (!/^01[3-9]\d{8}$/.test(normalised)) {
      return NextResponse.json({ error: 'সঠিক বাংলাদেশি ফোন নম্বর দাও (01XXXXXXXXX)।' }, { status: 400 });
    }

    await connectDB();

    // Find the course — allow unpublished in dev for testing
    const courseQuery = isDev
      ? { slug: COURSE_SLUG }
      : { slug: COURSE_SLUG, isPublished: true };

    const course = await Course.findOne(courseQuery);
    if (!course) {
      return NextResponse.json(
        { error: 'Course এখনো setup হয়নি। Admin panel থেকে course তৈরি করো।' },
        { status: 404 }
      );
    }

    // Find or create student user
    let user = await User.findOne({ phone: normalised });
    if (!user) {
      user = await User.create({
        name: name.trim(),
        phone: normalised,
        role: 'student',
      });
    } else {
      if (user.name !== name.trim()) {
        user.name = name.trim();
        await user.save();
      }

      const alreadyPurchased = user.purchasedCourses.some(
        (id: unknown) => String(id) === String(course._id)
      );
      if (alreadyPurchased) {
        return NextResponse.json({ alreadyPurchased: true });
      }
    }

    // Create pending order with a unique EPS merchant transaction id.
    const merchantTransactionId = newMerchantTransactionId();
    const order = await Order.create({
      student: user._id,
      course: course._id,
      amount: course.price,
      currency: 'BDT',
      paymentGateway: 'eps',
      merchantTransactionId,
      status: 'pending',
    });

    // Meta InitiateCheckout — shared event id for browser/CAPI deduplication.
    const eventId = newEventId();
    const tracking = {
      eventId,
      value: course.price,
      currency: 'BDT',
      contentId: COURSE_SLUG,
      contentName: course.title as string,
    };
    await sendCapiEvent({
      eventName: 'InitiateCheckout',
      eventId,
      user: { phone: user.phone, email: user.email, name: user.name, externalId: String(user._id) },
      signals: capiSignalsFromRequest(req),
      customData: {
        value: course.price,
        currency: 'BDT',
        content_ids: [COURSE_SLUG],
        content_name: course.title,
        content_type: 'product',
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const successUrl = `${baseUrl}/api/payment/success?orderId=${order._id}`;
    const failUrl = `${baseUrl}/api/payment/fail?orderId=${order._id}`;

    // Dev mode: if EPS credentials not set, bypass payment and go straight to success
    if (!epsConfigured()) {
      if (isDev) {
        // In development, simulate payment success directly
        return NextResponse.json({ paymentUrl: successUrl, ...tracking });
      }
      return NextResponse.json(
        { error: 'Payment gateway এখনো configure করা হয়নি। পরে চেষ্টা করো।' },
        { status: 503 }
      );
    }

    const { paymentUrl } = await initiatePayment({
      merchantTransactionId,
      customerOrderId: order._id.toString(),
      totalAmount: course.price,
      successUrl,
      failUrl,
      cancelUrl: `${baseUrl}/courses/${COURSE_SLUG}`,
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
      productName: course.title,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    return NextResponse.json({ paymentUrl, ...tracking });
  } catch (err) {
    console.error('[enroll/landing]', err);
    return NextResponse.json(
      { error: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।' },
      { status: 500 }
    );
  }
}
