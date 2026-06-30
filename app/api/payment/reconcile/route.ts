import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyPayment, epsConfigured } from '@/lib/eps';
import { Order } from '@/models/Order';
import { finalizeSuccessfulOrder } from '@/lib/order-fulfillment';

/**
 * Reconciliation sweep — the safety net for EPS having no IPN/webhook.
 *
 * Walks orders stuck in `pending` and re-checks each against EPS, finalizing the
 * ones that actually got charged (buyer closed the tab before the redirect, the
 * redirect-time verify hit a transient error, or the status settled late). Marks
 * conclusively-dead ones `failed`. Designed to be hit on a cron (see
 * scripts/reconcile-payments.mjs + the PM2 `reconcile` app in ecosystem.config.js).
 *
 * Auth: requires the RECONCILE_SECRET, via `Authorization: Bearer <secret>`,
 * the `x-reconcile-secret` header, or `?secret=`.
 */

// Skip orders younger than this — the live success/processing flow is still
// working them, and EPS may not have settled yet.
const MIN_AGE_MS = 2 * 60 * 1000; // 2 minutes
// Don't keep re-polling ancient abandoned carts forever.
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const BATCH_LIMIT = 50;

function authorized(req: NextRequest): boolean {
  const secret = process.env.RECONCILE_SECRET;
  if (!secret) return false;
  const auth = req.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : undefined;
  const provided =
    bearer ??
    req.headers.get('x-reconcile-secret') ??
    req.nextUrl.searchParams.get('secret') ??
    undefined;
  return provided === secret;
}

async function handle(req: NextRequest) {
  if (!process.env.RECONCILE_SECRET) {
    return NextResponse.json({ error: 'RECONCILE_SECRET not configured' }, { status: 503 });
  }
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!epsConfigured()) {
    return NextResponse.json({ error: 'EPS not configured' }, { status: 503 });
  }

  await connectDB();

  const now = Date.now();
  const orders = await Order.find({
    status: 'pending',
    merchantTransactionId: { $exists: true, $ne: null },
    createdAt: { $lte: new Date(now - MIN_AGE_MS), $gte: new Date(now - MAX_AGE_MS) },
  })
    .sort({ createdAt: 1 })
    .limit(BATCH_LIMIT);

  let succeeded = 0;
  let failed = 0;
  let stillPending = 0;
  const errors: string[] = [];

  for (const order of orders) {
    try {
      const result = await verifyPayment(order.merchantTransactionId!, { retries: 1 });

      const amountTampered =
        result.outcome === 'success' &&
        result.totalAmount != null &&
        Math.abs(result.totalAmount - order.amount) > 0.01;

      if (result.outcome === 'success' && !amountTampered) {
        await finalizeSuccessfulOrder(String(order._id), {
          epsTransactionId: result.epsTransactionId,
        });
        succeeded += 1;
      } else if (result.outcome === 'failed' || amountTampered) {
        await Order.findByIdAndUpdate(order._id, {
          status: 'failed',
          failReason: amountTampered ? 'amount_mismatch' : 'verification_failed',
        });
        failed += 1;
      } else {
        stillPending += 1;
      }
    } catch (err) {
      errors.push(`${String(order._id)}: ${err instanceof Error ? err.message : 'error'}`);
    }
  }

  return NextResponse.json({
    scanned: orders.length,
    succeeded,
    failed,
    stillPending,
    errors,
  });
}

export const GET = handle;
export const POST = handle;
