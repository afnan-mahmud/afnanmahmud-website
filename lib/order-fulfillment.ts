import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, type CapiEventInput, type RequestSignals } from '@/lib/meta-capi';
import type { IOrderCapturedSignals } from '@/models/Order';
import { sendTikTokEvent, type TikTokSignals } from '@/lib/tiktok-events';
import { sendPurchaseConfirmation } from '@/lib/sms';

export interface FinalizeResult {
  /**
   * Shared Meta event id for browser/CAPI Purchase deduplication. Stable for the
   * lifetime of the order: minted on the first success transition, persisted on
   * the order, and returned unchanged on every replay.
   */
  eventId: string;
  /** True only on the *first* transition to success (side-effects ran). */
  firstTransition: boolean;
  courseSlug: string;
  courseTitle: string;
  amount: number;
  currency: string;
}

/** True when these signals carry real browser context (i.e. came from a live request). */
function hasBrowserContext(signals?: RequestSignals): boolean {
  if (!signals) return false;
  return Boolean(
    signals.clientUserAgent ||
      signals.clientIpAddress ||
      signals.fbp ||
      signals.fbc ||
      signals.eventSourceUrl
  );
}

/**
 * Signals for the CAPI Purchase: the live request's if this call came from one
 * (redirect / status poll — unchanged behaviour), otherwise the ones captured at
 * enroll time and stored on the order. Only the reconciliation cron, which has
 * no request of its own, ever reaches the stored branch. Whole-object fallback,
 * never a field-level merge, so a live request's signals are used exactly as-is.
 */
function resolveSignals(
  live: RequestSignals | undefined,
  stored: IOrderCapturedSignals | undefined | null
): RequestSignals {
  if (hasBrowserContext(live)) return live!;
  if (!stored) return {};
  return {
    fbp: stored.fbp,
    fbc: stored.fbc,
    clientIpAddress: stored.clientIpAddress,
    clientUserAgent: stored.clientUserAgent,
    eventSourceUrl: stored.eventSourceUrl,
  };
}

/**
 * Mark an order paid and enroll the buyer — idempotently and exactly-once for
 * side-effects. Safe to call from the success redirect, the status poll, and the
 * reconciliation cron, possibly concurrently: the success transition is an atomic
 * conditional update, so enrolledCount / CAPI Purchase / confirmation SMS fire on
 * the first caller only. Enrollment itself ($addToSet) is always re-applied so a
 * paid user can never be left without course access.
 *
 * Returns null only if the order (or its course) no longer exists.
 */
export async function finalizeSuccessfulOrder(
  orderId: string,
  opts?: { epsTransactionId?: string; signals?: CapiEventInput['signals']; tiktokSignals?: TikTokSignals }
): Promise<FinalizeResult | null> {
  await connectDB();

  const candidateEventId = newEventId();

  // Atomically flip a non-success order to success. A matched doc means *we* were
  // the first to do so and therefore own the one-time side-effects. The Meta
  // Purchase event id is written in the *same* atomic update, binding one id to
  // the order forever — replays must never mint a fresh (undeduplicable) one.
  const flipped = await Order.findOneAndUpdate(
    { _id: orderId, status: { $ne: 'success' } },
    {
      status: 'success',
      metaPurchaseEventId: candidateEventId,
      ...(opts?.epsTransactionId ? { transactionId: opts.epsTransactionId } : {}),
      $unset: { failReason: '' },
    },
    { new: true }
  );
  const firstTransition = Boolean(flipped);

  const order = await Order.findById(orderId).populate<{
    course: { _id: unknown; slug: string; title: string };
  }>('course');
  if (!order || !order.course) return null;

  // Always (re)grant access — idempotent.
  const purchaser = await User.findByIdAndUpdate(
    order.student,
    { $addToSet: { purchasedCourses: order.course._id } },
    { new: false }
  ).select('phone name email');

  // Always return the *stored* id. On the first transition that is the one we
  // just wrote; on a replay it is whatever was written back then.
  let eventId = order.metaPurchaseEventId ?? undefined;
  if (!eventId) {
    // Order reached success before this field existed. Claim an id now so every
    // later replay returns the same value — but do NOT send CAPI: this is not a
    // first transition and that Purchase was already counted.
    const claimed = await Order.findOneAndUpdate(
      { _id: orderId, metaPurchaseEventId: null },
      { $set: { metaPurchaseEventId: candidateEventId } },
      { new: true }
    ).select('metaPurchaseEventId');
    if (claimed?.metaPurchaseEventId) {
      eventId = claimed.metaPurchaseEventId;
    } else {
      // Lost the race — another concurrent call claimed it; use theirs.
      const current = await Order.findById(orderId).select('metaPurchaseEventId');
      eventId = current?.metaPurchaseEventId ?? candidateEventId;
    }
  }

  if (firstTransition) {
    await Course.findByIdAndUpdate(order.course._id, { $inc: { enrolledCount: 1 } });

    await sendCapiEvent({
      eventName: 'Purchase',
      eventId,
      user: {
        phone: purchaser?.phone,
        email: purchaser?.email,
        name: purchaser?.name,
        externalId: String(order.student),
      },
      signals: resolveSignals(opts?.signals, order.capturedSignals),
      customData: {
        value: order.amount,
        currency: order.currency ?? 'BDT',
        content_ids: [order.course.slug],
        content_name: order.course.title,
        content_type: 'product',
        // Secondary dedup key + refund-by-order reconciliation. Same value the
        // browser Purchase sends (the order id, also carried as ?txn=).
        order_id: String(order._id),
      },
    });

    await sendTikTokEvent({
      eventName: 'CompletePayment',
      eventId,
      user: {
        phone: purchaser?.phone,
        email: purchaser?.email,
        name: purchaser?.name,
        externalId: String(order.student),
      },
      signals: opts?.tiktokSignals ?? {},
      properties: {
        contents: [{ content_id: order.course.slug, content_type: 'product', content_name: order.course.title }],
        content_type: 'product',
        value: order.amount,
        currency: order.currency ?? 'BDT',
      },
    });

    // Best-effort confirmation SMS — must never affect enrollment or the response.
    if (purchaser?.phone) {
      try {
        await sendPurchaseConfirmation(purchaser.phone, order.course.title);
      } catch (smsErr) {
        console.error('[order-fulfillment] confirmation SMS failed', smsErr);
      }
    }
  }

  return {
    eventId,
    firstTransition,
    courseSlug: order.course.slug,
    courseTitle: order.course.title,
    amount: order.amount,
    currency: order.currency ?? 'BDT',
  };
}
