import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { sendEnrollFollowup, isConfigured as whatsappConfigured } from '@/lib/whatsapp';

/**
 * Abandoned-enrollment WhatsApp follow-up sweep.
 *
 * Someone who submitted name+phone on the landing enroll modal but never
 * completed payment leaves a `pending` (later `failed`) Order behind. A few
 * minutes on, this sweep sends them a single WhatsApp follow-up asking if they
 * ran into a problem. Mirrors the reconcile cron: hit on a cron over localhost
 * (scripts/abandoned-whatsapp.mjs + the PM2 app in ecosystem.config.js), all
 * logic here in the Next server.
 *
 * Auth: RECONCILE_SECRET via `Authorization: Bearer <secret>`, `x-reconcile-secret`,
 * or `?secret=` (same internal-cron secret the reconcile sweep uses).
 *
 * No-op unless WHATSAPP_ABANDONED_ENABLED === 'true' — keep it off until the
 * `enroll_followup` template is APPROVED in Meta.
 */

// Give the live payment/reconcile flow time to settle before nudging.
const MIN_AGE_MS = 2 * 60 * 1000; // 2 minutes
// Only nudge recent abandonments — keeps the message timely and stops a burst of
// messages to hours-old leads the first time the feature is switched on.
const MAX_AGE_MS = 60 * 60 * 1000; // 60 minutes
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
  if (process.env.WHATSAPP_ABANDONED_ENABLED !== 'true') {
    return NextResponse.json({ ok: true, disabled: true, sent: 0 });
  }
  if (!whatsappConfigured()) {
    return NextResponse.json({ error: 'WhatsApp not configured' }, { status: 503 });
  }

  await connectDB();

  const now = Date.now();
  const orders = await Order.find({
    status: { $in: ['pending', 'failed'] },
    enrollFollowupSentAt: { $exists: false },
    createdAt: { $lte: new Date(now - MIN_AGE_MS), $gte: new Date(now - MAX_AGE_MS) },
  })
    .sort({ createdAt: 1 })
    .limit(BATCH_LIMIT);

  let sent = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const order of orders) {
    try {
      const user = await User.findById(order.student).select('phone purchasedCourses');
      if (!user?.phone) {
        skipped += 1;
        continue;
      }
      // Guard: a separate paid order may have enrolled them since — don't nudge.
      const owns = (user.purchasedCourses ?? []).some(
        (id: unknown) => String(id) === String(order.course)
      );
      if (owns) {
        // Stamp so we never reconsider this order.
        order.enrollFollowupSentAt = new Date();
        await order.save();
        skipped += 1;
        continue;
      }

      await sendEnrollFollowup(user.phone);
      order.enrollFollowupSentAt = new Date();
      await order.save();
      sent += 1;
    } catch (err) {
      // Leave enrollFollowupSentAt unset so a transient failure retries next
      // sweep (bounded by MAX_AGE). Persistent failure (template not approved)
      // means the feature should not have been enabled yet.
      errors.push(`${order._id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    ok: true,
    scanned: orders.length,
    sent,
    skipped,
    ...(errors.length ? { errors } : {}),
  });
}

export async function POST(req: NextRequest) {
  return handle(req);
}
