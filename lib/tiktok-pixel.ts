// Client-side TikTok Pixel helpers. All calls are safe no-ops when the pixel id
// is unset or `ttq` hasn't loaded yet. Mirrors lib/meta-pixel.ts.

export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

interface Ttq {
  track: (event: string, properties?: Record<string, unknown>, options?: { event_id?: string }) => void;
  page: (properties?: Record<string, unknown>) => void;
  identify: (userData: Record<string, unknown>) => void;
  load: (id: string, options?: Record<string, unknown>) => void;
  [key: string]: unknown;
}

declare global {
  interface Window {
    ttq?: Ttq;
  }
}

/** Phone → E.164 with BD country code (+8801XXXXXXXXX). RAW — the pixel SDK
 *  hashes it client-side. Mirrors the CAPI phone rule, plus the leading '+'. */
function toE164Phone(phone: string): string | undefined {
  let digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('0')) digits = `88${digits}`;
  else if (!digits.startsWith('88')) digits = `88${digits}`;
  return `+${digits}`;
}

/** Advanced matching: feed RAW email/phone/external_id to the pixel; the SDK
 *  normalises + SHA-256 hashes client-side. Safe no-op when the pixel isn't loaded. */
export function identifyTikTok(user: { email?: string; phone?: string; externalId?: string }): void {
  if (typeof window === 'undefined' || !window.ttq) return;
  if (!TIKTOK_PIXEL_ID) return;
  const data: Record<string, string> = {};
  if (user.email && user.email.trim()) data.email = user.email.trim().toLowerCase();
  const ph = user.phone ? toE164Phone(user.phone) : undefined;
  if (ph) data.phone_number = ph;
  if (user.externalId) data.external_id = user.externalId;
  if (Object.keys(data).length) window.ttq.identify(data);
}

/** Track a TikTok event, optionally with an event_id for Events-API dedup. */
export function trackTikTok(
  event: string,
  properties?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === 'undefined' || !window.ttq) return;
  if (eventId) {
    window.ttq.track(event, properties ?? {}, { event_id: eventId });
  } else {
    window.ttq.track(event, properties ?? {});
  }
}
