import 'server-only';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

/**
 * WhatsApp Cloud API (Meta Graph) helpers — server-only.
 *
 * Sending a reply and downloading inbound media both need a permanent/system
 * access token and the WABA phone-number id. When either is unset every call
 * fails gracefully (see `isConfigured`) so the webhook and admin routes degrade
 * to "not configured" rather than crashing — mirroring the webhook's own
 * behavior when the verify token / app secret are missing.
 */

const GRAPH_VERSION = 'v21.0';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Authentication template used for login OTP delivery. Must stay in sync with
 * `scripts/submit-whatsapp-otp-template.ts` (the script that submits it to Meta).
 */
const OTP_TEMPLATE_NAME = 'login_otp';
const OTP_TEMPLATE_LANG = 'en_US';

/** 24 hours in ms — WhatsApp's free-form customer-service window. */
export const WINDOW_MS = 24 * 60 * 60 * 1000;

/** True when we can talk to the Graph API (token + phone number id present). */
export function isConfigured(): boolean {
  return Boolean(ACCESS_TOKEN && PHONE_NUMBER_ID);
}

/**
 * Convert a BD local phone (`01XXXXXXXXX`, as stored on `User.phone`) to a
 * WhatsApp wa_id (`8801XXXXXXXXX`). Mirrors the `88` prefixing in `lib/sms.ts`.
 */
function localPhoneToWaId(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('88') ? digits : `88${digits}`;
}

/**
 * Deliver a login OTP via the approved WhatsApp AUTHENTICATION template.
 *
 * A first-contact login message has no open 24h window, so free-form text is not
 * allowed — it must go through the `login_otp` authentication template. The code
 * is passed both as the body parameter and as the copy-code button parameter
 * (WhatsApp requires both). Throws on any failure (not configured, template not
 * yet approved, recipient not on WhatsApp, network) so the caller can fall back
 * to SMS. Returns the WhatsApp message id on success.
 */
export async function sendOtpTemplate(phone: string, code: string): Promise<string> {
  if (!isConfigured()) throw new Error('WhatsApp not configured');

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: localPhoneToWaId(phone),
        type: 'template',
        template: {
          name: OTP_TEMPLATE_NAME,
          language: { code: OTP_TEMPLATE_LANG },
          components: [
            { type: 'body', parameters: [{ type: 'text', text: code }] },
            // Copy-code OTP button: WhatsApp echoes the same code into the button.
            { type: 'button', sub_type: 'url', index: '0', parameters: [{ type: 'text', text: code }] },
          ],
        },
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`WhatsApp OTP send failed: ${msg}`);
  }
  return data?.messages?.[0]?.id as string;
}

/** True when `lastInboundAt` is within the 24h free-form reply window. */
export function isWithinWindow(lastInboundAt?: Date | null): boolean {
  if (!lastInboundAt) return false;
  return Date.now() - new Date(lastInboundAt).getTime() < WINDOW_MS;
}

/**
 * Send a free-form text message to a customer. Only valid inside the 24h window;
 * the caller is responsible for that check. Returns the WhatsApp message id.
 */
export async function sendText(waId: string, text: string): Promise<string> {
  if (!isConfigured()) throw new Error('WhatsApp not configured');

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: waId,
        type: 'text',
        text: { body: text },
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`WhatsApp send failed: ${msg}`);
  }
  return data?.messages?.[0]?.id as string;
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/3gpp': '3gp',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'audio/amr': 'amr',
  'application/pdf': 'pdf',
};

/**
 * Resolve a WhatsApp media id, download the bytes (authenticated), and save them
 * under `public/uploads/whatsapp/`. Returns the public URL + mime, or null on any
 * failure (not configured, network error, etc.) so message handling never breaks.
 */
export async function downloadMedia(
  mediaId: string
): Promise<{ mediaPath: string; mediaMime: string } | null> {
  if (!isConfigured()) return null;
  try {
    // 1. Look up the (short-lived, authenticated) download URL + mime.
    const metaRes = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${mediaId}`,
      { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
    );
    if (!metaRes.ok) return null;
    const meta = await metaRes.json();
    const url: string | undefined = meta?.url;
    const mime: string = meta?.mime_type ?? 'application/octet-stream';
    if (!url) return null;

    // 2. Download the actual bytes (also requires the bearer token).
    const fileRes = await fetch(url, { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } });
    if (!fileRes.ok) return null;
    const buf = Buffer.from(await fileRes.arrayBuffer());

    // 3. Persist under public/uploads/whatsapp/.
    const baseMime = mime.split(';')[0].trim();
    const ext = EXT_BY_MIME[baseMime] ?? 'bin';
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const dir = join(process.cwd(), 'public', 'uploads', 'whatsapp');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buf);

    return { mediaPath: `/uploads/whatsapp/${filename}`, mediaMime: baseMime };
  } catch (err) {
    console.error('[whatsapp] media download failed', err);
    return null;
  }
}

/**
 * Convert a WhatsApp wa_id (`8801XXXXXXXXX`) to the BD local phone form
 * (`01XXXXXXXXX`) stored on `User.phone`, for matching inbound senders to
 * enrolled students. Returns null when the id isn't a BD number.
 */
export function waIdToLocalPhone(waId: string): string | null {
  const digits = waId.replace(/\D/g, '');
  if (digits.startsWith('880')) return `0${digits.slice(3)}`;
  return null;
}
