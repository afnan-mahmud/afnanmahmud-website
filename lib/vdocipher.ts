/**
 * VdoCipher playback client.
 *
 * VdoCipher serves DRM-protected (Widevine/FairPlay) video. Playback works via a
 * short-lived OTP minted **server-side** and handed to the iframe player:
 *
 *   POST https://dev.vdocipher.com/api/videos/{videoId}/otp
 *     Header: Authorization: Apisecret <VDOCIPHER_API_SECRET>
 *     Body:   { ttl, annotate }            // annotate = double-serialized JSON string
 *     →       { otp, playbackInfo }
 *
 *   Embed: https://player.vdocipher.com/v2/?otp={otp}&playbackInfo={playbackInfo}
 *
 * The API secret is read here and never exported or sent to the client.
 */

const OTP_BASE = 'https://dev.vdocipher.com/api/videos';

/** Default OTP validity (seconds). Short-lived per playback session. */
const DEFAULT_TTL = 300;

/** True when the API secret needed for a live VdoCipher call is present. */
export function vdocipherConfigured(): boolean {
  return Boolean(process.env.VDOCIPHER_API_SECRET);
}

/**
 * Build the `annotate` value for a moving (`rtext`) dynamic watermark showing
 * `label` (the buyer's phone number). VdoCipher requires the annotation array to
 * be serialized into a string *before* it is placed in the request body, so this
 * returns the already-stringified array.
 */
export function buildWatermark(label: string): string {
  // Strip anything that could break the embedded JSON; phone numbers are digits only.
  const text = String(label).replace(/[^\d+ ]/g, '').trim() || 'protected';
  return JSON.stringify([
    {
      type: 'rtext',
      text,
      alpha: '0.60',
      color: '0xFFFFFF',
      size: '15',
      interval: '4000',
      skip: '2000',
    },
  ]);
}

export interface OtpResult {
  otp: string;
  playbackInfo: string;
}

/**
 * Mint a playback OTP for a VdoCipher video. Throws on a non-2xx response or if
 * the secret is missing — callers gate on {@link vdocipherConfigured} first.
 */
export async function getOtp(
  videoId: string,
  opts?: { annotate?: string; ttl?: number }
): Promise<OtpResult> {
  const secret = process.env.VDOCIPHER_API_SECRET;
  if (!secret) throw new Error('VDOCIPHER_API_SECRET is not configured');

  const body: Record<string, unknown> = { ttl: opts?.ttl ?? DEFAULT_TTL };
  if (opts?.annotate) body.annotate = opts.annotate;

  const res = await fetch(`${OTP_BASE}/${encodeURIComponent(videoId)}/otp`, {
    method: 'POST',
    headers: {
      Authorization: `Apisecret ${secret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`VdoCipher OTP failed: ${res.status} — ${text}`);
  }

  const data = (await res.json()) as Partial<OtpResult>;
  if (!data.otp || !data.playbackInfo) {
    throw new Error('VdoCipher OTP response missing otp/playbackInfo');
  }
  return { otp: data.otp, playbackInfo: data.playbackInfo };
}
