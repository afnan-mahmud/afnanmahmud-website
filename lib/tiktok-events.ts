import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';

const API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';

const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
const ACCESS_TOKEN = process.env.TIKTOK_EVENTS_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE;

/** Whether server-side Events API is configured (pixel id + access token present). */
export function isTikTokEventsEnabled(): boolean {
  return Boolean(PIXEL_ID && ACCESS_TOKEN);
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Normalise + SHA-256 hash a value (trim + lowercase). */
function hashField(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalised = value.trim().toLowerCase();
  if (!normalised) return undefined;
  return sha256(normalised);
}

/** Phone → E.164 with '+' (BD country code), then SHA-256 hashed. */
function hashPhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined;
  let digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.startsWith('0')) digits = `88${digits}`;
  else if (!digits.startsWith('88')) digits = `88${digits}`;
  return sha256(`+${digits}`);
}

export interface TikTokUserInfo {
  phone?: string;
  email?: string;
  /** Unused by TikTok (no first/last split) — kept for call-site parity with Meta. */
  name?: string;
  externalId?: string;
}

export interface TikTokSignals {
  ttclid?: string;
  ttp?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
  referrer?: string;
}

/** Pull ttclid/ttp cookies (or ?ttclid= param), client IP, UA, url and referrer. */
export function tiktokSignalsFromRequest(req: NextRequest): TikTokSignals {
  const ttclid =
    req.cookies.get('ttclid')?.value ??
    req.nextUrl.searchParams.get('ttclid') ??
    undefined;
  const ttp = req.cookies.get('_ttp')?.value;
  const fwd = req.headers.get('x-forwarded-for');
  const clientIpAddress = fwd ? fwd.split(',')[0]!.trim() : undefined;
  const clientUserAgent = req.headers.get('user-agent') ?? undefined;
  const referrer = req.headers.get('referer') ?? undefined;
  return {
    ttclid,
    ttp,
    clientIpAddress,
    clientUserAgent,
    eventSourceUrl: referrer ?? req.nextUrl.href,
    referrer,
  };
}

function buildUser(user: TikTokUserInfo, signals: TikTokSignals) {
  const u: Record<string, unknown> = {};
  const ph = hashPhone(user.phone);
  if (ph) u.phone = ph;
  const em = hashField(user.email);
  if (em) u.email = em;
  const ext = hashField(user.externalId);
  if (ext) u.external_id = ext;
  if (signals.ttclid) u.ttclid = signals.ttclid;
  if (signals.ttp) u.ttp = signals.ttp;
  if (signals.clientIpAddress) u.ip = signals.clientIpAddress;
  if (signals.clientUserAgent) u.user_agent = signals.clientUserAgent;
  return u;
}

export interface TikTokEventInput {
  eventName: string;
  eventId: string;
  user: TikTokUserInfo;
  signals: TikTokSignals;
  properties?: Record<string, unknown>;
}

/**
 * Fire-and-forget server-side TikTok Events API event.
 * No-op when env is unset; never throws into the caller's flow.
 */
export async function sendTikTokEvent(input: TikTokEventInput): Promise<void> {
  if (!isTikTokEventsEnabled()) return;

  const payload = {
    event_source: 'web',
    event_source_id: PIXEL_ID,
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
    data: [
      {
        event: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        user: buildUser(input.user, input.signals),
        properties: input.properties ?? {},
        page: {
          url: input.signals.eventSourceUrl,
          referrer: input.signals.referrer,
        },
      },
    ],
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': ACCESS_TOKEN!,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[tiktok-events] ${input.eventName} failed:`, res.status, text);
      return;
    }
    // TikTok returns HTTP 200 with { code, message }; code !== 0 signals an error.
    const json = (await res.json().catch(() => null)) as { code?: number; message?: string } | null;
    if (json && json.code !== 0) {
      console.error(`[tiktok-events] ${input.eventName} api error:`, json.code, json.message);
    }
  } catch (err) {
    console.error(`[tiktok-events] ${input.eventName} error:`, err);
  }
}
