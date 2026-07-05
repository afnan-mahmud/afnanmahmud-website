import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, type CapiEventInput } from '@/lib/meta-capi';
import { sendTikTokEvent, type TikTokSignals } from '@/lib/tiktok-events';
import { sendPurchaseConfirmation } from '@/lib/sms';

export interface FinalizeResult {
  /** Shared Meta event id for browser/CAPI Purchase deduplication. */
  eventId: string;
  /** True only on the *first* transition to success (side-effects ran). */
  firstTransition: boolean;
  courseSlug: string;
  courseTitle: string;
  amount: number;
  currency: string;
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

  // Atomically flip a non-success order to success. A matched doc means *we* were
  // the first to do so and therefore own the one-time side-effects.
  const flipped = await Order.findOneAndUpdate(
    { _id: orderId, status: { $ne: 'success' } },
    {
      status: 'success',
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

  const eventId = newEventId();

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
      signals: opts?.signals ?? {},
      customData: {
        value: order.amount,
        currency: order.currency ?? 'BDT',
        content_ids: [order.course.slug],
        content_name: order.course.title,
        content_type: 'product',
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
