import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyPayment } from '@/lib/eps';
import { Order } from '@/models/Order';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, capiSignalsFromRequest } from '@/lib/meta-capi';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transaction_id') ?? searchParams.get('tran_id');

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=invalid_order`);
  }

  try {
    await connectDB();

    const order = await Order.findById(orderId).populate<{ course: { slug: string; title: string; _id: unknown } }>('course');
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=invalid_order`);
    }

    // Verify payment with EPS if transactionId provided
    const txId = transactionId ?? order.transactionId;
    let isVerified = false;

    if (txId) {
      isVerified = await verifyPayment(txId);
    } else {
      // No transactionId from EPS callback — treat as verified for sandbox/testing
      isVerified = process.env.NODE_ENV !== 'production';
    }

    if (!isVerified) {
      await Order.findByIdAndUpdate(orderId, { status: 'failed', failReason: 'verification_failed' });
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=verification_failed&course=${order.course.slug}`);
    }

    // Mark order success
    if (txId) {
      await Order.findByIdAndUpdate(orderId, { status: 'success', transactionId: txId });
    } else {
      await Order.findByIdAndUpdate(orderId, { status: 'success' });
    }

    // Add course to user's purchasedCourses
    const purchaser = await User.findByIdAndUpdate(
      order.student,
      { $addToSet: { purchasedCourses: order.course._id } },
      { new: false }
    ).select('phone name');

    // Increment enrolled count
    await Course.findByIdAndUpdate(order.course._id, {
      $inc: { enrolledCount: 1 },
    });

    // Meta Purchase — shared event id for browser/CAPI deduplication.
    const eventId = newEventId();
    await sendCapiEvent({
      eventName: 'Purchase',
      eventId,
      user: {
        phone: purchaser?.phone,
        name: purchaser?.name,
        externalId: String(order.student),
      },
      signals: capiSignalsFromRequest(req),
      customData: {
        value: order.amount,
        currency: order.currency ?? 'BDT',
        content_ids: [order.course.slug],
        content_name: order.course.title,
        content_type: 'product',
      },
    });

    const successParams = new URLSearchParams({
      course: order.course.slug,
      title: order.course.title,
      eid: eventId,
      value: String(order.amount),
      currency: order.currency ?? 'BDT',
    });
    return NextResponse.redirect(`${baseUrl}/payment/success?${successParams.toString()}`);
  } catch (err) {
    console.error('[payment/success]', err);
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=server_error`);
  }
}
