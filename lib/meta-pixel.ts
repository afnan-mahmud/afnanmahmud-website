// Client-side Meta Pixel helpers. All calls are safe no-ops when the pixel
// id is unset or fbq hasn't loaded yet.

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
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
