import { createHash, randomUUID } from 'crypto';
import type { NextRequest } from 'next/server';

const GRAPH_VERSION = 'v21.0';

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

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

interface RequestSignals {
  fbp?: string;
  fbc?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
}

/** Pull fbp/fbc cookies, client IP, user-agent and URL from an incoming request. */
export function capiSignalsFromRequest(req: NextRequest): RequestSignals {
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
    eventSourceUrl: req.headers.get('referer') ?? req.nextUrl.href,
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

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        action_source: 'website',
        event_source_url: input.signals.eventSourceUrl,
        user_data: buildUserData(input.user, input.signals),
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
