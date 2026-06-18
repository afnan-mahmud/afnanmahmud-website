// Client-side Meta Pixel helpers. All calls are safe no-ops when the pixel
// id is unset or fbq hasn't loaded yet.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

/**
 * Attach manual advanced-matching parameters to the already-initialised pixel
 * by re-calling fbq('init', …) with user data. Pass RAW values (e.g. a phone as
 * 8801XXXXXXXXX, an email, names) — the pixel SDK normalises and SHA-256 hashes
 * them client-side before sending. Safe no-op when the pixel isn't loaded.
 */
export function setPixelAdvancedMatching(userData: Record<string, string>): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (!META_PIXEL_ID) return;
  window.fbq('init', META_PIXEL_ID, userData);
}

/** Track a Meta standard event, optionally with an eventID for CAPI dedup. */
export function trackPixel(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (eventId) {
    window.fbq('track', eventName, params ?? {}, { eventID: eventId });
  } else {
    window.fbq('track', eventName, params ?? {});
  }
}

/**
 * Track a Meta *custom* event (e.g. ViewDemoClass) with an optional eventID for
 * CAPI deduplication. Custom events use fbq('trackCustom', …).
 */
export function trackCustomPixel(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (eventId) {
    window.fbq('trackCustom', eventName, params ?? {}, { eventID: eventId });
  } else {
    window.fbq('trackCustom', eventName, params ?? {});
  }
}
