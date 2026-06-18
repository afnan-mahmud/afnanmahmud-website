import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendCapiEvent, newEventId, capiSignalsFromRequest } from '@/lib/meta-capi';

/**
 * Server-side CAPI ViewContent, mirroring the browser pixel fired on course /
 * landing pages. This closes the coverage gap where the pixel reported far more
 * ViewContent events than the server. Visitors may be anonymous (marketing
 * pages) or logged in (dashboard course pages); when a session exists we enrich
 * user_data with the buyer's hashed identifiers, otherwise Meta matches on
 * fbp/fbc/IP/user-agent. Uses the eventId supplied by the client so the pixel
 * and this CAPI call deduplicate.
 *
 * No-op when CAPI env is unset; never throws into the caller.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      eventId?: string;
      contentId?: string;
      contentName?: string;
      value?: number;
      currency?: string;
    };
    const eventId = body.eventId || newEventId();

    let user = {};
    try {
      const session = await auth();
      if (session?.user?.id) {
        await connectDB();
        const u = await User.findById(session.user.id).select('phone name email');
        user = {
          phone: u?.phone,
          email: u?.email,
          name: u?.name,
          externalId: String(session.user.id),
        };
      }
    } catch {
      // Anonymous visitor — match on request signals only.
    }

    await sendCapiEvent({
      eventName: 'ViewContent',
      eventId,
      user,
      signals: capiSignalsFromRequest(req),
      customData: {
        value: typeof body.value === 'number' ? body.value : undefined,
        currency: body.currency || 'BDT',
        content_ids: body.contentId ? [body.contentId] : undefined,
        content_name: body.contentName,
        content_type: 'product',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track/view-content]', err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
