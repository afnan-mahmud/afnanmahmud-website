import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { initiatePayment, newMerchantTransactionId, epsConfigured } from '@/lib/eps';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, capiSignalsFromRequest } from '@/lib/meta-capi';
import { sendTikTokEvent, tiktokSignalsFromRequest } from '@/lib/tiktok-events';
import { COURSE_SLUG } from '../../../_landing/constants';

const isDev = process.env.NODE_ENV !== 'production';

// Base URL for building EPS redirect targets. On this subdomain's process
// NEXTAUTH_URL is https://course.afnanmahmud.com, so EPS returns to THIS app's
// own payment routes — never the main domain.
const baseUrl = () => process.env.NEXTAUTH_URL ?? 'http://localhost:3001';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string; phone?: string };
    const { name, phone } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'আপনার নাম ও ফোন নম্বর দিতে হবে।' }, { status: 400 });
    }

    const normalised = phone.replace(/[\s\-]/g, '').replace(/^\+?880/, '0');
    if (!/^01[3-9]\d{8}$/.test(normalised)) {
      return NextResponse.json({ error: 'সঠিক বাংলাদেশি ফোন নম্বর দাও (01XXXXXXXXX)।' }, { status: 400 });
    }

    await connectDB();

    const courseQuery = isDev ? { slug: COURSE_SLUG } : { slug: COURSE_SLUG, isPublished: true };
    const course = await Course.findOne(courseQuery);
    if (!course) {
      return NextResponse.json(
        { error: 'Course এখনো setup হয়নি। পরে চেষ্টা করুন।' },
        { status: 404 }
      );
    }

    let user = await User.findOne({ phone: normalised });
    if (!user) {
      user = await User.create({ name: name.trim(), phone: normalised, role: 'student' });
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

    await sendTikTokEvent({
      eventName: 'InitiateCheckout',
      eventId,
      user: { phone: user.phone, email: user.email, name: user.name, externalId: String(user._id) },
      signals: tiktokSignalsFromRequest(req),
      properties: {
        contents: [{ content_id: COURSE_SLUG, content_type: 'product', content_name: course.title }],
        content_type: 'product',
        value: course.price,
        currency: 'BDT',
      },
    });

    const root = baseUrl();
    const successUrl = `${root}/api/payment/success?orderId=${order._id}`;
    const failUrl = `${root}/api/payment/fail?orderId=${order._id}`;
    const cancelUrl = `${root}/`;

    if (!epsConfigured()) {
      if (isDev) {
        return NextResponse.json({ paymentUrl: successUrl, ...tracking });
      }
      return NextResponse.json(
        { error: 'Payment gateway এখনো configure করা হয়নি। পরে চেষ্টা করুন।' },
        { status: 503 }
      );
    }

    const { paymentUrl } = await initiatePayment({
      merchantTransactionId,
      customerOrderId: order._id.toString(),
      totalAmount: course.price,
      successUrl,
      failUrl,
      cancelUrl,
      customerName: user.name,
      customerPhone: user.phone,
      customerEmail: user.email,
      productName: course.title,
      ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    });

    return NextResponse.json({ paymentUrl, ...tracking });
  } catch (err) {
    console.error('[course-landing enroll]', err);
    return NextResponse.json(
      { error: 'কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
