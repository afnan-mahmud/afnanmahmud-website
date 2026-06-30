# Google Tag Manager (dataLayer) Integration — Design

**Date:** 2026-07-01
**Status:** Approved (pending spec review)

## Goal

Add Google Tag Manager (GTM) as a **dataLayer event hub** so that Google Ads
conversion tracking, GA4, and remarketing can be configured entirely from the
GTM dashboard — **without further code changes**. The application code's only
job is: (1) load the GTM container, and (2) `dataLayer.push()` at every funnel
and key-UI touchpoint.

The existing Meta Pixel + CAPI layers are **left untouched**; GTM runs in
parallel (coexist).

## Principles (mirror the existing Meta pattern)

- **No-op when unconfigured.** When `NEXT_PUBLIC_GTM_ID` is unset the container
  never loads and every `pushToDataLayer` call is a safe no-op. Nothing breaks.
- **SSR-safe.** All pushes guard on `typeof window !== 'undefined'`.
- **Reuse the existing `event_id`.** Each conversion event already mints (or
  receives) an `event_id` used for Meta pixel↔CAPI deduplication. The **same
  id** is pushed into the dataLayer. This gives a stable dedup key so that a
  future Google server-side path (Google Ads offline/Enhanced Conversions API,
  GA4 Measurement Protocol) can deduplicate client vs server hits. For
  `purchase`, the EPS `transaction_id` / order id is also pushed as the natural
  Google Ads `order_id`.
- **Coexist, don't migrate.** Meta Pixel/CAPI code is not modified. GTM is
  additive.

## New code units

| File | Responsibility |
|---|---|
| `lib/gtm.ts` | Exports `GTM_ID` (from `process.env.NEXT_PUBLIC_GTM_ID`), a typed `pushToDataLayer(event, params)` helper, and event-name constants. SSR-safe; no-op when `GTM_ID` unset. Initializes `window.dataLayer` array if absent. |
| `components/tracking/GoogleTagManager.tsx` | Renders the GTM `<Script strategy="afterInteractive">` snippet + the `<noscript>` iframe fallback. Returns `null` when `GTM_ID` is unset. Mounted in `app/layout.tsx` beside `<MetaPixel />`. |

No changes to `lib/meta-pixel.ts`, `lib/meta-capi.ts`, `components/tracking/MetaPixel.tsx`.

## Environment

- New var: `NEXT_PUBLIC_GTM_ID` (e.g. `GTM-XXXXXXX`). Added to `.env.example`.
  Real value goes in `.env.local`.

## dataLayer event schema

GA4-friendly event names so GTM tag setup is straightforward. Every conversion
event carries `event_id` (same id as the Meta layer).

### Funnel events

| dataLayer `event` | Fired from | Params |
|---|---|---|
| `page_view` | every client route change (in `GoogleTagManager.tsx`, mirrors MetaPixel's PageView tracker) | `page_path` |
| `view_item` | `ViewContentTracker` (course pages + AI landing) | `content_id`, `content_name`, `value`, `currency`, `event_id` |
| `view_demo_class` | demo class page (`DemoClassClient`) | `content_id`, `content_name`, `event_id` |
| `begin_checkout` | `EnrollModal` on successful enroll response | `content_id`, `content_name`, `value`, `currency`, `event_id` |
| `purchase` | payment success page | `content_id`, `content_name`, `value`, `currency`, `transaction_id`, `event_id`, `user_data.phone` |
| `sign_up` | OTP verify page | `event_id`, `user_data.phone` |

`event_id` sources (reused, not newly generated):
- `view_item` / `view_demo_class`: the client-generated `crypto.randomUUID()`
  already created in `ViewContentTracker` / `DemoClassClient`.
- `begin_checkout`: `data.eventId` from the `/api/enroll/landing` response.
- `purchase`: `eid` search param (server-generated in `/api/payment/success`).
- `sign_up`: the `eventId` already built on the OTP page.

### Key UI interaction events

| dataLayer `event` | Fired from | Method |
|---|---|---|
| `enroll_click` | "Enroll" CTA click (before modal opens) | explicit `pushToDataLayer` |
| `form_start` | first field focus inside `EnrollModal` | explicit `pushToDataLayer` (once per mount) |
| `demo_class_ready` | demo player finished loading (VdoCipher auto-loads, so this is a demo-viewed signal, not a literal play) | `onReady` from the player |
| `scroll_depth` (25/50/75/100%) | landing pages | **GTM built-in Scroll Depth trigger — no app code** |

> Scroll depth and generic outbound-link clicks are handled by GTM's own
> built-in triggers, so they are intentionally **not** added to the codebase.

## Enhanced Conversions (user data)

`purchase` and `sign_up` push `user_data: { phone: '8801XXXXXXXXX' }`. Phone
sources differ by page and are kept **out of the URL** (no PII in query strings):
- `sign_up` (OTP page): the phone the user just typed is already available
  client-side (`amPhone`, normalized to `8801XXXXXXXXX`).
- `purchase` (success page): the buyer is not logged in after a landing-modal
  enroll, so there is no session. The `EnrollModal` already persists the phone
  in `localStorage` (`devc_enroll_retry`) before redirecting to EPS; the success
  page reads it back, normalizes to `8801XXXXXXXXX`, and pushes it. If absent,
  `purchase` still fires with `transaction_id` (order id) so Enhanced
  Conversions can be backfilled via Google Ads offline import keyed on order_id.

In GTM, Enhanced Conversions hashes this **client-side
with SHA-256**; the raw phone is never sent to Google. This lifts match rate and
ROAS for Google Ads.

## What is configured in the GTM dashboard (one-time, no code)

1. Create the container → put `GTM-XXXXXXX` into `.env.local` as `NEXT_PUBLIC_GTM_ID`.
2. Google Ads Conversion tag → trigger on `purchase` (optionally `sign_up`,
   `begin_checkout`). Map `value`, `currency`, `transaction_id`.
3. Turn on Enhanced Conversions; map `user_data.phone`.
4. (Optional) GA4 config tag + GA4 event tags listening to the same dataLayer events.
5. Built-in Scroll Depth + Click triggers for behavioral signals.
6. New campaigns/conversions later → add tags in GTM only; **no code changes**.

> **Note for GTM setup:** `page_view` is a *custom* dataLayer event the app
> pushes on SPA route changes (mirrors the existing MetaPixel pattern). The
> `gtm.js` container load also fires GTM's own initial pageview. When wiring a
> GA4 config/page tag, trigger it on **either** the built-in All Pages **or**
> the custom `page_view` — not both — to avoid double-counting.

## Out of scope (YAGNI)

- Migrating Meta Pixel/CAPI into GTM.
- A consent-management platform (can be added in GTM later).
- Server-side GTM container.
- GA4 ecommerce `items[]` array schema (flat params chosen for this scope).

## Testing / verification

- `NEXT_PUBLIC_GTM_ID` unset → no GTM script in DOM, `pushToDataLayer` no-ops,
  existing Meta flow unaffected (manual check + `npm run build`).
- With a test container → GTM Preview (Tag Assistant) shows each event firing
  with the documented params at each funnel step.
