# TikTok Pixel + Events API integration — design

Date: 2026-07-06

## Goal

Add TikTok Pixel (browser) + Events API (server) tracking that mirrors the
existing Meta Pixel + Conversions API funnel, so TikTok ad campaigns receive
well-matched, deduplicated conversion signals from both the client and the
server. IDs and the access token come from environment variables; when unset,
everything is a safe no-op (identical guarantee to the Meta layer).

Google Tag Manager (GTM) and the Meta layer are left completely untouched — the
TikTok calls fire alongside them at the same call sites.

## Environment variables

Mirrors the Meta naming convention. Added to `.env.example` (blank).

```
NEXT_PUBLIC_TIKTOK_PIXEL_ID=      # client pixel code (public)
TIKTOK_EVENTS_ACCESS_TOKEN=       # server Events API token (secret)
TIKTOK_TEST_EVENT_CODE=           # optional; TikTok Events Manager "Test Events"
```

- Client code no-ops when `NEXT_PUBLIC_TIKTOK_PIXEL_ID` is unset (or `ttq` not loaded).
- Server code no-ops when either `NEXT_PUBLIC_TIKTOK_PIXEL_ID` or
  `TIKTOK_EVENTS_ACCESS_TOKEN` is unset.

## Event name mapping (Meta → TikTok)

TikTok uses its own standard-event vocabulary. Notably **Purchase → CompletePayment**.

| Funnel step         | Meta event           | TikTok event          | Layers                    |
|---------------------|----------------------|-----------------------|---------------------------|
| Page view           | PageView             | (auto `ttq.page()`)   | pixel only                |
| Course/landing view | ViewContent          | `ViewContent`         | pixel + Events API        |
| Enroll submit       | InitiateCheckout     | `InitiateCheckout`    | pixel + Events API        |
| Payment success     | Purchase             | `CompletePayment`     | pixel + Events API        |
| OTP verified        | CompleteRegistration | `CompleteRegistration`| pixel + Events API        |
| Demo class viewed   | ViewDemoClass (custom)| `ViewDemoClass` (custom)| pixel + Events API      |

## Deduplication

Each conversion already generates one shared `eventId` used by the Meta pixel and
Meta CAPI. TikTok **reuses that same `eventId`** for its pixel + Events API pair.
Each platform deduplicates only within itself (TikTok pixel vs TikTok Events API,
by `event_id`), so sharing the id across platforms is safe and requires no new id
generation at any call site.

## New modules (independent, not coupled to Meta)

### `lib/tiktok-pixel.ts` (client) — mirrors `lib/meta-pixel.ts`
- `export const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID`
- `trackTikTok(event, properties?, eventId?)` — calls `window.ttq.track(event, properties, { event_id })`; safe no-op if `ttq` missing.
- `identifyTikTok({ email?, phone?, externalId? })` — calls `window.ttq.identify({ email, phone_number, external_id })` with RAW values (SDK hashes client-side); phone normalised to E.164 `+8801XXXXXXXXX`. Advanced matching, mirrors `setPixelAdvancedMatching`.
- `declare global { interface Window { ttq?: ... } }`

### `lib/tiktok-events.ts` (server) — mirrors `lib/meta-capi.ts`
- `isTikTokEventsEnabled(): boolean` — pixel id + access token both present.
- `sendTikTokEvent({ eventName, eventId, user, signals, properties })` — fire-and-forget POST; no-op when disabled; never throws into caller.
- `tiktokSignalsFromRequest(req)` — pulls `ttclid` (cookie or `?ttclid=` param), `ttp` (`_ttp` cookie), client IP (`x-forwarded-for`), user-agent, and page url/referrer.
- SHA-256 hashing helpers: email (trim+lowercase), phone (digits → E.164 `+880…`), external_id.
- Reuses the `CapiUserInfo` shape (phone/email/name/externalId) so call sites pass the same user object they already build for Meta.
- Endpoint: `POST https://business-api.tiktok.com/open_api/v1.3/event/track/`, header `Access-Token: <token>`, body `{ event_source: 'web', event_source_id: <pixel id>, test_event_code?, data: [{ event, event_time, event_id, user, properties, page }] }`.

### `components/tracking/TikTokPixel.tsx` — mirrors `components/tracking/MetaPixel.tsx`
- Loads TikTok base script (`ttq.load(id)`, `ttq.page()`), tracks `ttq.page()` on client-side route change via a `<Suspense>`-wrapped tracker.
- Renders `null` when `NEXT_PUBLIC_TIKTOK_PIXEL_ID` unset.
- Mounted in `app/layout.tsx` next to `<MetaPixel />` / `<GoogleTagManager />`.

## Call-site changes (TikTok fires alongside existing Meta/GTM)

Client (add one `trackTikTok`/`identifyTikTok` call each, reusing the existing eventId):
- `components/tracking/ViewContentTracker.tsx` → `ViewContent`
- `app/ai-for-developers/EnrollModal.tsx` → `InitiateCheckout`
- `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx` → `InitiateCheckout`
- `app/(public)/payment/success/page.tsx` → `CompletePayment`
- `app/(auth)/auth/otp/page.tsx` → `identifyTikTok({ phone })` + `CompleteRegistration`
- `app/ai-for-developers/demo/DemoClassClient.tsx` → custom `ViewDemoClass`

Server (add one `sendTikTokEvent` next to each `sendCapiEvent`, same eventId + user object):
- `app/api/track/view-content/route.ts` → `ViewContent`
- `app/api/track/complete-registration/route.ts` → `CompleteRegistration`
- `app/api/track/view-demo/route.ts` → `ViewDemoClass`
- `app/api/enroll/landing/route.ts` → `InitiateCheckout`
- `lib/order-fulfillment.ts` → `CompletePayment` (covers both the success redirect and the status-poll path, which both call `finalizeSuccessfulOrder`)

## Non-goals / YAGNI

- No new deduplication id generation — reuse existing per-conversion `eventId`.
- No GTM/Meta changes.
- No admin UI / dashboard for TikTok.
- No retry queue for failed Events API posts (fire-and-forget, matches Meta CAPI).

## Verification

- With env unset: `npm run build` + lint pass, no runtime calls, site behaves identically (all TikTok code no-ops).
- With test env set: TikTok Events Manager "Test Events" shows deduplicated pixel + server events across the funnel using `TIKTOK_TEST_EVENT_CODE`.
