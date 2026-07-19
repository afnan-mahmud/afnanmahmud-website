import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyPayment, epsConfigured, type EpsVerifyOutcome } from '@/lib/eps';
import { Order } from '@/models/Order';
import { capiSignalsFromRequest } from '@/lib/meta-capi';
import { tiktokSignalsFromRequest } from '@/lib/tiktok-events';
import { finalizeSuccessfulOrder } from '@/lib/order-fulfillment';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orderId = searchParams.get('orderId');

  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3001';

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=invalid_order`);
  }

  try {
    await connectDB();

    const order = await Order.findById(orderId).populate<{ course: { slug: string } }>('course');
    if (!order || !order.course) {
      return NextResponse.redirect(`${baseUrl}/payment/failed?reason=invalid_order`);
    }
    const courseSlug = order.course.slug;

    // Already finalized (page refresh / duplicate EPS redirect): re-grant access
    // idempotently and go straight to the success page — no re-verification needed.
    if (order.status === 'success') {
      const fin = await finalizeSuccessfulOrder(orderId, {
        signals: capiSignalsFromRequest(req),
        tiktokSignals: tiktokSignalsFromRequest(req),
      });
      return redirectSuccess(baseUrl, orderId, fin);
    }

    // Verify server-side via EPS CheckMerchantTransactionStatus, keyed by the
    // merchantTransactionId we stored at order creation.
    let outcome: EpsVerifyOutcome;
    let epsTransactionId: string | undefined;

    if (epsConfigured() && order.merchantTransactionId) {
      const result = await verifyPayment(order.merchantTransactionId);
      epsTransactionId = result.epsTransactionId;

      // Anti-tampering: a confirmed charge whose amount doesn't match the order is
      // rejected as a hard failure.
      if (
        result.outcome === 'success' &&
        result.totalAmount != null &&
        Math.abs(result.totalAmount - order.amount) > 0.01
      ) {
        outcome = 'failed';
      } else {
        outcome = result.outcome;
      }
    } else {
      // No live gateway configured — accept only outside production (dev bypass);
      // in production an unconfigured gateway can't confirm, so treat as pending.
      outcome = process.env.NODE_ENV !== 'production' ? 'success' : 'pending';
    }

    if (outcome === 'failed') {
      await Order.findByIdAndUpdate(orderId, { status: 'failed', failReason: 'verification_failed' });
      return NextResponse.redirect(
        `${baseUrl}/payment/failed?reason=verification_failed&course=${courseSlug}`
      );
    }

    if (outcome === 'pending') {
      // Charge may well have gone through but isn't settled yet. Do NOT mark
      // failed — leave the order pending and let the processing page (and the
      // reconciliation cron) finish it. The buyer never sees a false "failed".
      return NextResponse.redirect(
        `${baseUrl}/payment/processing?orderId=${orderId}&course=${courseSlug}`
      );
    }

    // outcome === 'success'
    const fin = await finalizeSuccessfulOrder(orderId, {
      epsTransactionId,
      signals: capiSignalsFromRequest(req),
      tiktokSignals: tiktokSignalsFromRequest(req),
    });
    return redirectSuccess(baseUrl, orderId, fin);
  } catch (err) {
    console.error('[payment/success]', err);
    // On an unexpected server error we leave the order untouched (likely still
    // pending) and route to processing so a real charge is recovered, not lost.
    return NextResponse.redirect(`${baseUrl}/payment/processing?orderId=${orderId}`);
  }
}

function redirectSuccess(
  baseUrl: string,
  orderId: string,
  fin: Awaited<ReturnType<typeof finalizeSuccessfulOrder>>
): NextResponse {
  if (!fin) {
    return NextResponse.redirect(`${baseUrl}/payment/failed?reason=invalid_order`);
  }
  const params = new URLSearchParams({
    course: fin.courseSlug,
    title: fin.courseTitle,
    eid: fin.eventId,
    value: String(fin.amount),
    currency: fin.currency,
    txn: orderId,
  });
  return NextResponse.redirect(`${baseUrl}/payment/success?${params.toString()}`);
}
