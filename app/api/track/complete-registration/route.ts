import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, capiSignalsFromRequest } from '@/lib/meta-capi';

/**
 * Fires a server-side CAPI CompleteRegistration for the logged-in user.
 * Auth-gated so it can't be abused, and uses the eventId provided by the
 * client so the browser pixel + CAPI deduplicate.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { eventId?: string };
    const eventId = body.eventId || newEventId();

    await connectDB();
    const user = await User.findById(session.user.id).select('phone name');

    await sendCapiEvent({
      eventName: 'CompleteRegistration',
      eventId,
      user: {
        phone: user?.phone,
        name: user?.name,
        externalId: String(session.user.id),
      },
      signals: capiSignalsFromRequest(req),
      customData: { status: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track/complete-registration]', err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
