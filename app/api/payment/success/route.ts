import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyPayment, epsConfigured } from '@/lib/eps';
import { Order } from '@/models/Order';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, capiSignalsFromRequest } from '@/lib/meta-capi';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get('orderId');

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

    // Verify the payment server-side via EPS CheckMerchantTransactionStatus,
    // keyed by the merchantTransactionId we stored when the order was created.
    let isVerified = false;
    let epsTransactionId: string | undefined;

    if (epsConfigured() && order.merchantTransactionId) {
      const result = await verifyPayment(order.merchantTransactionId);
      isVerified = result.verified;
      epsTransactionId = result.epsTransactionId;

      // Guard against amount tampering: the verified amount must match the order.
      if (
        isVerified &&
        result.totalAmount != null &&
        Math.abs(result.totalAmount - order.amount) > 0.01
      ) {
        isVerified = false;
      }
    } else {
      // No live gateway configured — accept only outside production (dev bypass).
      isVerified = process.env.NODE_ENV !== 'production';
    }

    if (!isVerified) {
      await Order.findByIdAndUpdate(orderId, { status: 'failed', failReason: 'verification_failed' });
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=verification_failed&course=${order.course.slug}`);
    }

    // Mark order success
    await Order.findByIdAndUpdate(orderId, {
      status: 'success',
      ...(epsTransactionId ? { transactionId: epsTransactionId } : {}),
    });

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
