import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { ingestWebhook } from '@/lib/whatsapp-ingest';

/**
 * WhatsApp Cloud API webhook.
 *
 * Two jobs, both required by Meta:
 *  - GET  : one-time verification handshake. When you save the callback URL in
 *           the App dashboard, Meta calls this with `hub.mode=subscribe`,
 *           `hub.verify_token=<your token>` and a `hub.challenge`. We check the
 *           token against WHATSAPP_WEBHOOK_VERIFY_TOKEN and echo the challenge
 *           back as plain text, else respond 403.
 *  - POST : delivery of events (message status: sent/delivered/read/failed, and
 *           inbound messages). We verify Meta's X-Hub-Signature-256 (HMAC-SHA256
 *           of the raw body keyed by the App Secret), log the event, and ACK 200
 *           quickly so Meta doesn't retry.
 *
 * OTP delivery itself is OUTBOUND (a separate call to the Graph API) and does
 * not depend on this webhook — this endpoint only exists so Meta accepts the
 * subscription and so we can observe delivery/read/failure status.
 */

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

// GET — verification handshake.
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  if (!VERIFY_TOKEN) {
    console.error('[whatsapp/webhook] WHATSAPP_WEBHOOK_VERIFY_TOKEN not set');
    return new NextResponse('Not configured', { status: 500 });
  }

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    // Meta wants the raw challenge string back, not JSON.
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

/** Constant-time check of Meta's X-Hub-Signature-256 over the raw request body. */
function isValidSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!APP_SECRET) {
    // No secret configured — can't verify. Fail closed in production, allow in dev
    // so local testing (e.g. curl) works without the secret.
    return process.env.NODE_ENV !== 'production';
  }
  if (!signatureHeader?.startsWith('sha256=')) return false;

  const expected = createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
  const received = signatureHeader.slice('sha256='.length);

  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(received, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// POST — event delivery (message statuses + inbound messages).
export async function POST(req: NextRequest) {
  try {
    // Read the RAW body first — signature is computed over the exact bytes.
    const rawBody = await req.text();

    if (!isValidSignature(rawBody, req.headers.get('x-hub-signature-256'))) {
      console.error('[whatsapp/webhook] invalid signature');
      return new NextResponse('Forbidden', { status: 403 });
    }

    const payload = JSON.parse(rawBody);

    // Persist inbound messages + delivery statuses (idempotent). Any failure is
    // swallowed below so we still ACK 200 and Meta doesn't hammer retries.
    await ingestWebhook(payload);

    // Always ACK 200 fast; Meta retries on non-2xx.
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[whatsapp/webhook]', err);
    // Still 200 so Meta doesn't hammer retries on a parse hiccup.
    return NextResponse.json({ received: true });
  }
}
