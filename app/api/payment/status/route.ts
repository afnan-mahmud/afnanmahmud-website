import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyPayment, epsConfigured } from '@/lib/eps';
import { Order } from '@/models/Order';
import { capiSignalsFromRequest } from '@/lib/meta-capi';
import { finalizeSuccessfulOrder } from '@/lib/order-fulfillment';

/**
 * Polled by the /payment/processing page while an order is still being verified.
 * For a pending order it does ONE live EPS re-check (no long retry — the page
 * polls repeatedly) so the buyer's screen resolves quickly, without waiting for
 * the reconciliation cron.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ status: 'failed', reason: 'invalid_order' }, { status: 400 });
  }

  try {
    await connectDB();

    const order = await Order.findById(orderId).populate<{ course: { slug: string; title: string } }>('course');
    if (!order || !order.course) {
      return NextResponse.json({ status: 'failed', reason: 'invalid_order' }, { status: 404 });
    }

    if (order.status === 'success') {
      const fin = await finalizeSuccessfulOrder(orderId, { signals: capiSignalsFromRequest(req) });
      return NextResponse.json(successPayload(orderId, fin, order.course));
    }

    if (order.status === 'failed') {
      return NextResponse.json({ status: 'failed', course: order.course.slug });
    }

    // Pending — re-check once against EPS.
    if (epsConfigured() && order.merchantTransactionId) {
      const result = await verifyPayment(order.merchantTransactionId, { retries: 0 });

      const amountTampered =
        result.outcome === 'success' &&
        result.totalAmount != null &&
        Math.abs(result.totalAmount - order.amount) > 0.01;

      if (result.outcome === 'success' && !amountTampered) {
        const fin = await finalizeSuccessfulOrder(orderId, {
          epsTransactionId: result.epsTransactionId,
          signals: capiSignalsFromRequest(req),
        });
        return NextResponse.json(successPayload(orderId, fin, order.course));
      }

      if (result.outcome === 'failed' || amountTampered) {
        await Order.findByIdAndUpdate(orderId, { status: 'failed', failReason: 'verification_failed' });
        return NextResponse.json({ status: 'failed', course: order.course.slug });
      }
    }

    return NextResponse.json({ status: 'pending', course: order.course.slug });
  } catch (err) {
    console.error('[payment/status]', err);
    // Transient — tell the page to keep polling rather than declaring failure.
    return NextResponse.json({ status: 'pending' });
  }
}

function successPayload(
  orderId: string,
  fin: Awaited<ReturnType<typeof finalizeSuccessfulOrder>>,
  course: { slug: string; title: string }
) {
  if (!fin) return { status: 'failed', course: course.slug };
  return {
    status: 'success',
    course: fin.courseSlug,
    title: fin.courseTitle,
    eid: fin.eventId,
    value: fin.amount,
    currency: fin.currency,
    txn: orderId,
  };
}
