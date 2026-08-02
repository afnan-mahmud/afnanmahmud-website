import { createHash, randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';
import { isOwnedUrl, ownedOrigin } from '@/lib/owned-hosts';

const GRAPH_VERSION = 'v21.0';

/** ISO 3166-1 alpha-2, lowercase — Meta's expected `country` format before hashing. */
const FUNNEL_COUNTRY = 'bd';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
/**
 * Test Events code — honoured in dev/staging only. A non-empty
 * META_TEST_EVENT_CODE routes 100% of events to the Events Manager *Test Events*
 * tab, where they do NOT count as conversions and cannot be used for
 * optimisation. Leaving that possible in production means one forgotten
 * debugging env var silently kills every live conversion, so production ignores
 * the variable entirely.
 */
const TEST_EVENT_CODE =
  process.env.NODE_ENV !== 'production' ? process.env.META_TEST_EVENT_CODE : undefined;

/** Whether server-side CAPI is configured (pixel id + access token present). */
export function isCapiEnabled(): boolean {
  return Boolean(PIXEL_ID && ACCESS_TOKEN);
}

/** A fresh event id, shared between the browser pixel and CAPI for deduplication. */
export function newEventId(): string {
  return randomUUID();
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Normalise + SHA-256 hash a value per Meta's customer-information rules. */
function hashField(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalised = value.trim().toLowerCase();
  if (!normalised) return undefined;
  return sha256(normalised);
}

/** Phone → digits only with BD country code (8801XXXXXXXXX), then hashed. */
function hashPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  // Local BD format 01XXXXXXXXX → 8801XXXXXXXXX
  if (digits.startsWith('0')) digits = `88${digits}`;
  else if (!digits.startsWith('88')) digits = `88${digits}`;
  return sha256(digits);
}

export interface CapiUserInfo {
  phone?: string;
  email?: string;
  name?: string;
  externalId?: string;
}

export interface RequestSignals {
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
}

export interface CapiSignalOptions {
  /**
   * Canonical *owned* URL to report as `event_source_url` when the request's
   * referer is a domain we don't own. Required for the Purchase on
   * `/api/payment/success`, whose referer is the EPS gateway.
   */
  canonicalUrl?: string;
}

/**
 * Resolve `event_source_url`, never letting a foreign domain through:
 * owned referer (the normal case for ViewContent / InitiateCheckout) → the
 * caller's canonical owned URL → this request's own URL if owned → our origin.
 */
function resolveEventSourceUrl(
  referer: string | null,
  canonicalUrl: string | undefined,
  requestUrl: string
): string {
  if (isOwnedUrl(referer)) return referer!;
  if (canonicalUrl) return canonicalUrl;
  if (isOwnedUrl(requestUrl)) return requestUrl;
  return ownedOrigin();
}

/** Pull fbp/fbc cookies, client IP, user-agent and URL from an incoming request. */
export function capiSignalsFromRequest(
  req: NextRequest,
  opts?: CapiSignalOptions
): RequestSignals {
  const fbp = req.cookies.get('_fbp')?.value;
  const fbc = req.cookies.get('_fbc')?.value;
  const fwd = req.headers.get('x-forwarded-for');
  const clientIpAddress = fwd ? fwd.split(',')[0]!.trim() : undefined;
  const clientUserAgent = req.headers.get('user-agent') ?? undefined;
  return {
    fbp,
    fbc,
    clientIpAddress,
    clientUserAgent,
    eventSourceUrl: resolveEventSourceUrl(
      req.headers.get('referer'),
      opts?.canonicalUrl,
      req.nextUrl.href
    ),
  };
}

function buildUserData(user: CapiUserInfo, signals: RequestSignals) {
  const ud: Record<string, unknown> = {};
  const ph = hashPhone(user.phone);
  if (ph) ud.ph = [ph];
  const em = hashField(user.email);
  if (em) ud.em = [em];
  // Split the full name into first/last so Meta gets both fn and ln.
  if (user.name && user.name.trim()) {
    const parts = user.name.trim().split(/\s+/);
    const fn = hashField(parts[0]);
    if (fn) ud.fn = [fn];
    if (parts.length > 1) {
      const ln = hashField(parts.slice(1).join(' '));
      if (ln) ud.ln = [ln];
    }
  }
  const ext = hashField(user.externalId);
  if (ext) ud.external_id = [ext];
  // The funnel is Bangladesh-only by construction (BD phone regex, BDT-only
  // pricing), so country is deterministic — free match quality on every event.
  const country = hashField(FUNNEL_COUNTRY);
  if (country) ud.country = [country];
  if (signals.fbp) ud.fbp = signals.fbp;
  if (signals.fbc) ud.fbc = signals.fbc;
  if (signals.clientIpAddress) ud.client_ip_address = signals.clientIpAddress;
  if (signals.clientUserAgent) ud.client_user_agent = signals.clientUserAgent;
  return ud;
}

export interface CapiEventInput {
  eventName: string;
  eventId: string;
  user: CapiUserInfo;
  signals: RequestSignals;
  customData?: Record<string, unknown>;
}

/**
 * Fire-and-forget server-side Conversions API event.
 * No-op when env is unset; never throws into the caller's flow.
 */
export async function sendCapiEvent(input: CapiEventInput): Promise<void> {
  if (!isCapiEnabled()) return;

  const userData = buildUserData(input.user, input.signals);
  /**
   * Meta requires client_user_agent on `website` events; without it the event is
   * rejected outright. That only happens on the reconciliation path for orders
   * created before capturedSignals existed (see lib/order-fulfillment.ts) — for
   * those, `system_generated` is honest and accepted, where `website` with an
   * empty context is neither.
   */
  const actionSource = userData.client_user_agent ? 'website' : 'system_generated';

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: actionSource,
        event_source_url: input.signals.eventSourceUrl,
        user_data: userData,
        custom_data: input.customData,
      },
    ],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error(`[meta-capi] ${input.eventName} failed:`, res.status, text);
    }
  } catch (err) {
    console.error(`[meta-capi] ${input.eventName} error:`, err);
  }
}
