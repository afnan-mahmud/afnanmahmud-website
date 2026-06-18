import { NextRequest, NextResponse } from 'next/server';
import { sendCapiEvent, newEventId, capiSignalsFromRequest } from '@/lib/meta-capi';

/**
 * Public CAPI event for visits to the demo-class page (custom event
 * `ViewDemoClass`). Visitors are anonymous (not logged in), so there is no
 * customer PII to hash — Meta still matches on fbp/fbc/IP/user-agent pulled
 * from the request. Uses the eventId supplied by the client so the browser
 * pixel (trackCustom) and this CAPI call deduplicate.
 *
 * No-op when CAPI env is unset; never throws into the caller.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      eventId?: string;
      contentId?: string;
      contentName?: string;
    };
    const eventId = body.eventId || newEventId();

    await sendCapiEvent({
      eventName: 'ViewDemoClass',
      eventId,
      user: {},
      signals: capiSignalsFromRequest(req),
      customData: {
        content_ids: body.contentId ? [body.contentId] : undefined,
        content_name: body.contentName,
        content_type: 'product',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[track/view-demo]', err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
