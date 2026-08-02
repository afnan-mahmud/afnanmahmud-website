// Microsoft Clarity config + client-side event helpers. The project id is
// managed via env and every call here is a no-op when it's unset, so Clarity
// never breaks existing flows.

export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

// Route prefixes Clarity must never track — the authenticated areas. Everything
// else (the (public) group, the ai-for-developers landing, and auth/otp) counts
// as public and is tracked.
export const CLARITY_EXCLUDED_PREFIXES = ['/admin', '/dashboard'];

/** True when the given path is a public route Clarity is allowed to track. */
export function isClarityAllowedPath(pathname: string): boolean {
  return !CLARITY_EXCLUDED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Canonical Clarity custom-event names. Deliberately identical to the GTM
 *  event names in lib/gtm.ts so the funnel reads the same in both dashboards.
 *  No `page_view` — Clarity records pageviews natively. */
export const CLARITY_EVENT = {
  viewItem: 'view_item',
  viewDemoClass: 'view_demo_class',
  demoClassReady: 'demo_class_ready',
  enrollClick: 'enroll_click',
  formStart: 'form_start',
  beginCheckout: 'begin_checkout',
  purchase: 'purchase',
  signUp: 'sign_up',
} as const;

export type ClarityEventName = (typeof CLARITY_EVENT)[keyof typeof CLARITY_EVENT];

/** Context attached alongside an event as Clarity custom tags. */
export type ClarityTags = Record<string, string | number | undefined | null>;

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

/**
 * Resolve `window.clarity`, installing the same command-queue stub the official
 * snippet uses if the tag hasn't executed yet (the snippet's `c[a]=c[a]||…`
 * keeps ours, and the loaded tag drains `clarity.q`). That way events fired on
 * mount — view_item, purchase — are never dropped by a load-order race.
 *
 * Returns null when Clarity is disabled (no id), during SSR, or on a route the
 * tag is not allowed to track, so nothing queues up where it can't flush.
 */
function clarityQueue(): ClarityFn | null {
  if (typeof window === 'undefined') return null;
  if (!CLARITY_ID) return null;
  if (!isClarityAllowedPath(window.location.pathname)) return null;

  if (!window.clarity) {
    // The tag replays each queued entry with `.apply`, so a rest array stands
    // in for the snippet's `arguments` object.
    const stub = ((...args: unknown[]) => {
      (stub.q = stub.q || []).push(args);
    }) as ClarityFn;
    window.clarity = stub;
  }
  return window.clarity;
}

/** Attach custom tags to the current Clarity session/page. Values are coerced
 *  to strings; empty ones are skipped. These are what you filter sessions and
 *  build funnels on in the Clarity dashboard. */
export function setClarityTags(tags: ClarityTags): void {
  const clarity = clarityQueue();
  if (!clarity) return;
  for (const [key, raw] of Object.entries(tags)) {
    if (raw === undefined || raw === null || raw === '') continue;
    clarity('set', key, String(raw));
  }
}

/** Fire a Clarity custom event. Clarity events carry no parameters of their
 *  own, so any context is written first as custom tags. */
export function trackClarity(event: ClarityEventName, tags?: ClarityTags): void {
  const clarity = clarityQueue();
  if (!clarity) return;
  if (tags) setClarityTags(tags);
  clarity('event', event);
}

/** Ask Clarity to prioritise recording this session. Use on the money paths
 *  (checkout, purchase) so those recordings survive sampling. */
export function upgradeClarity(reason: string): void {
  clarityQueue()?.('upgrade', reason);
}
