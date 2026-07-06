# TikTok Pixel + Events API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add TikTok Pixel (browser) + Events API (server) tracking that mirrors the existing Meta Pixel + Conversions API funnel, so TikTok ad campaigns receive well-matched, deduplicated conversion signals from both client and server.

**Architecture:** Two new independent libs (`lib/tiktok-pixel.ts` client, `lib/tiktok-events.ts` server) and one base-script component (`components/tracking/TikTokPixel.tsx`), all safe no-ops when env is unset — identical to the Meta layer. TikTok calls are then added alongside every existing Meta call site, reusing the same per-conversion `eventId` (each platform dedups within itself). Meta and GTM code is untouched.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript, `next/script`, Node `crypto` (SHA-256), TikTok Events API v1.3.

## Global Constraints

- **No test framework exists.** Verify each task with `npx tsc --noEmit` and `npm run lint`; final task runs `npm run build`.
- **Safe no-op guarantee:** client code no-ops when `NEXT_PUBLIC_TIKTOK_PIXEL_ID` unset or `window.ttq` missing; server code no-ops when `NEXT_PUBLIC_TIKTOK_PIXEL_ID` OR `TIKTOK_EVENTS_ACCESS_TOKEN` unset. Never throw into a caller's flow.
- **Do not modify** any Meta (`fbq`, `lib/meta-*`) or GTM (`lib/gtm`, `pushToDataLayer`) code. TikTok fires *in addition*.
- **Reuse the existing `eventId`** at every call site — do not generate a new id for TikTok.
- **Env var names (exact):** `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `TIKTOK_EVENTS_ACCESS_TOKEN`, `TIKTOK_TEST_EVENT_CODE`.
- **Phone normalisation (BD):** strip non-digits; if starts with `0` or not `88`, prefix `88`; TikTok wants E.164 with leading `+` (e.g. `+8801712345678`).
- **TikTok event names:** `ViewContent`, `InitiateCheckout`, `CompletePayment` (= Meta Purchase), `CompleteRegistration`, `ViewDemoClass` (custom).

---

### Task 1: TikTok client pixel helpers + env keys

**Files:**
- Create: `lib/tiktok-pixel.ts`
- Modify: `.env.example` (after the Meta block, ~line 57)

**Interfaces:**
- Produces:
  - `TIKTOK_PIXEL_ID: string | undefined`
  - `trackTikTok(event: string, properties?: Record<string, unknown>, eventId?: string): void`
  - `identifyTikTok(user: { email?: string; phone?: string; externalId?: string }): void`

- [ ] **Step 1: Create `lib/tiktok-pixel.ts`**

```ts
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
```

- [ ] **Step 2: Add env keys to `.env.example`**

Insert immediately after the `META_TEST_EVENT_CODE=` line:

```bash
# TikTok Pixel + Events API. Unset = disabled (all TikTok tracking is a no-op).
NEXT_PUBLIC_TIKTOK_PIXEL_ID=
TIKTOK_EVENTS_ACCESS_TOKEN=
TIKTOK_TEST_EVENT_CODE=
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/tiktok-pixel.ts .env.example
git commit -m "feat(tiktok): client pixel helpers + env keys"
```

---

### Task 2: TikTok server Events API helper

**Files:**
- Create: `lib/tiktok-events.ts`

**Interfaces:**
- Produces:
  - `isTikTokEventsEnabled(): boolean`
  - `interface TikTokUserInfo { phone?: string; email?: string; name?: string; externalId?: string }`
  - `interface TikTokSignals { ttclid?: string; ttp?: string; clientIpAddress?: string; clientUserAgent?: string; eventSourceUrl?: string; referrer?: string }`
  - `tiktokSignalsFromRequest(req: NextRequest): TikTokSignals`
  - `interface TikTokEventInput { eventName: string; eventId: string; user: TikTokUserInfo; signals: TikTokSignals; properties?: Record<string, unknown> }`
  - `sendTikTokEvent(input: TikTokEventInput): Promise<void>`

- [ ] **Step 1: Create `lib/tiktok-events.ts`**

```ts
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
```

- [ ] **Step 2: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add lib/tiktok-events.ts
git commit -m "feat(tiktok): server Events API helper"
```

---

### Task 3: TikTokPixel base-script component + mount in root layout

**Files:**
- Create: `components/tracking/TikTokPixel.tsx`
- Modify: `app/layout.tsx` (import + render)

**Interfaces:**
- Consumes: `TIKTOK_PIXEL_ID` from `lib/tiktok-pixel.ts` (Task 1).
- Produces: default-exported `<TikTokPixel />` React component.

- [ ] **Step 1: Create `components/tracking/TikTokPixel.tsx`**

```tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { TIKTOK_PIXEL_ID } from '@/lib/tiktok-pixel';

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Fire a TikTok page view on every client-side route change (the base
    // script fires the first one on load).
    if (typeof window !== 'undefined' && window.ttq) window.ttq.page();
  }, [pathname, searchParams]);

  return null;
}

/**
 * Loads the TikTok Pixel base script and tracks page views across navigations.
 * Renders nothing when NEXT_PUBLIC_TIKTOK_PIXEL_ID is unset.
 */
export default function TikTokPixel() {
  if (!TIKTOK_PIXEL_ID) return null;

  return (
    <>
      <Script id="tiktok-pixel-base" strategy="afterInteractive">
        {`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
            ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
            ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
            for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
            ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
            ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var s=document.createElement("script");s.type="text/javascript",s.async=!0,s.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(s,a)};
            ttq.load('${TIKTOK_PIXEL_ID}');
            ttq.page();
          }(window, document, 'ttq');
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
```

- [ ] **Step 2: Mount in `app/layout.tsx`**

Add the import next to the other tracking imports (after the `GoogleTagManager` import on line 7):

```tsx
import TikTokPixel from "@/components/tracking/TikTokPixel";
```

Render it next to `<GoogleTagManager />` inside `<body>` (after line 38):

```tsx
        <MetaPixel />
        <Clarity />
        <GoogleTagManager />
        <TikTokPixel />
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/tracking/TikTokPixel.tsx app/layout.tsx
git commit -m "feat(tiktok): base pixel script mounted in root layout"
```

---

### Task 4: ViewContent (browser pixel + Events API)

**Files:**
- Modify: `components/tracking/ViewContentTracker.tsx`
- Modify: `app/api/track/view-content/route.ts`

**Interfaces:**
- Consumes: `trackTikTok` (Task 1); `sendTikTokEvent`, `tiktokSignalsFromRequest` (Task 2).

- [ ] **Step 1: Add TikTok import to `ViewContentTracker.tsx`**

After the existing `import { trackPixel } from '@/lib/meta-pixel';` line (line 4):

```tsx
import { trackTikTok } from '@/lib/tiktok-pixel';
```

- [ ] **Step 2: Fire the TikTok pixel** in `ViewContentTracker.tsx`

Immediately after the existing `trackPixel('ViewContent', customData, eventId);` line (line 45):

```tsx
    trackTikTok(
      'ViewContent',
      {
        contents: [{ content_id: contentId, content_type: 'product', content_name: contentName }],
        content_type: 'product',
        value,
        currency,
      },
      eventId
    );
```

- [ ] **Step 3: Add TikTok import to the route** `app/api/track/view-content/route.ts`

After the existing meta-capi import (line 5):

```ts
import { sendTikTokEvent, tiktokSignalsFromRequest } from '@/lib/tiktok-events';
```

- [ ] **Step 4: Send the Events API event** in the route

Immediately after the existing `await sendCapiEvent({ ... });` block (ends line 58), before `return NextResponse.json({ ok: true });`:

```ts
    await sendTikTokEvent({
      eventName: 'ViewContent',
      eventId,
      user,
      signals: tiktokSignalsFromRequest(req),
      properties: {
        contents: body.contentId
          ? [{ content_id: body.contentId, content_type: 'product', content_name: body.contentName }]
          : undefined,
        content_type: 'product',
        value: typeof body.value === 'number' ? body.value : undefined,
        currency: body.currency || 'BDT',
      },
    });
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/tracking/ViewContentTracker.tsx app/api/track/view-content/route.ts
git commit -m "feat(tiktok): ViewContent on pixel + Events API"
```

---

### Task 5: InitiateCheckout (both enroll modals + enroll route)

**Files:**
- Modify: `app/ai-for-developers/EnrollModal.tsx`
- Modify: `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx`
- Modify: `app/api/enroll/landing/route.ts`

**Interfaces:**
- Consumes: `trackTikTok` (Task 1); `sendTikTokEvent`, `tiktokSignalsFromRequest` (Task 2).

- [ ] **Step 1: Import `trackTikTok` in `app/ai-for-developers/EnrollModal.tsx`**

After `import { trackPixel } from '@/lib/meta-pixel';` (line 5):

```tsx
import { trackTikTok } from '@/lib/tiktok-pixel';
```

- [ ] **Step 2: Fire TikTok InitiateCheckout** in `app/ai-for-developers/EnrollModal.tsx`

Inside the `if (data.eventId) {` block, immediately after the existing `trackPixel('InitiateCheckout', { ... }, data.eventId);` call (ends line 122):

```tsx
          trackTikTok(
            'InitiateCheckout',
            {
              contents: data.contentId
                ? [{ content_id: data.contentId, content_type: 'product', content_name: data.contentName }]
                : undefined,
              content_type: 'product',
              value: data.value,
              currency: data.currency ?? 'BDT',
            },
            data.eventId
          );
```

- [ ] **Step 3: Repeat for `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx`**

Add the same import after `import { trackPixel } from '@/lib/meta-pixel';` (line 5):

```tsx
import { trackTikTok } from '@/lib/tiktok-pixel';
```

And add the same `trackTikTok('InitiateCheckout', …)` call immediately after that file's existing `trackPixel('InitiateCheckout', { ... }, data.eventId);` call (ends line 127):

```tsx
          trackTikTok(
            'InitiateCheckout',
            {
              contents: data.contentId
                ? [{ content_id: data.contentId, content_type: 'product', content_name: data.contentName }]
                : undefined,
              content_type: 'product',
              value: data.value,
              currency: data.currency ?? 'BDT',
            },
            data.eventId
          );
```

- [ ] **Step 4: Import in the enroll route** `app/api/enroll/landing/route.ts`

After the meta-capi import (line 7):

```ts
import { sendTikTokEvent, tiktokSignalsFromRequest } from '@/lib/tiktok-events';
```

- [ ] **Step 5: Send the Events API event** in the enroll route

Immediately after the existing `await sendCapiEvent({ ... });` block (ends line 104), before the `const baseUrl = …` line:

```ts
    await sendTikTokEvent({
      eventName: 'InitiateCheckout',
      eventId,
      user: { phone: user.phone, email: user.email, name: user.name, externalId: String(user._id) },
      signals: tiktokSignalsFromRequest(req),
      properties: {
        contents: [{ content_id: COURSE_SLUG, content_type: 'product', content_name: course.title }],
        content_type: 'product',
        value: course.price,
        currency: 'BDT',
      },
    });
```

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/ai-for-developers/EnrollModal.tsx "app/(public)/mobile-app-development-by-ai/EnrollModal.tsx" app/api/enroll/landing/route.ts
git commit -m "feat(tiktok): InitiateCheckout on pixel + Events API"
```

---

### Task 6: CompletePayment (success page pixel + order fulfillment Events API)

**Files:**
- Modify: `app/(public)/payment/success/page.tsx`
- Modify: `lib/order-fulfillment.ts`
- Modify: `app/api/payment/success/route.ts`
- Modify: `app/api/payment/status/route.ts`

**Interfaces:**
- Consumes: `trackTikTok` (Task 1); `sendTikTokEvent`, `tiktokSignalsFromRequest`, `TikTokSignals` (Task 2).
- Produces: `finalizeSuccessfulOrder` gains an optional `opts.tiktokSignals?: TikTokSignals`.

- [ ] **Step 1: Import `trackTikTok` in `app/(public)/payment/success/page.tsx`**

After `import { trackPixel } from '@/lib/meta-pixel';` (line 8):

```tsx
import { trackTikTok } from '@/lib/tiktok-pixel';
```

- [ ] **Step 2: Fire TikTok CompletePayment** in `app/(public)/payment/success/page.tsx`

Immediately after the existing `trackPixel('Purchase', { ... }, eid);` call (ends line 37):

```tsx
    trackTikTok(
      'CompletePayment',
      {
        contents: courseSlug
          ? [{ content_id: courseSlug, content_type: 'product', content_name: courseTitle }]
          : undefined,
        content_type: 'product',
        value: value ? Number(value) : undefined,
        currency,
      },
      eid
    );
```

- [ ] **Step 3: Extend `finalizeSuccessfulOrder` in `lib/order-fulfillment.ts`**

Add the import after the meta-capi import (line 5):

```ts
import { sendTikTokEvent, type TikTokSignals } from '@/lib/tiktok-events';
```

Change the `opts` parameter type (line 31) from:

```ts
  opts?: { epsTransactionId?: string; signals?: CapiEventInput['signals'] }
```

to:

```ts
  opts?: { epsTransactionId?: string; signals?: CapiEventInput['signals']; tiktokSignals?: TikTokSignals }
```

- [ ] **Step 4: Send the TikTok CompletePayment inside the first-transition block**

In `lib/order-fulfillment.ts`, immediately after the existing `await sendCapiEvent({ eventName: 'Purchase', … });` block (ends line 82), still inside `if (firstTransition) {`:

```ts
    await sendTikTokEvent({
      eventName: 'CompletePayment',
      eventId,
      user: {
        phone: purchaser?.phone,
        email: purchaser?.email,
        name: purchaser?.name,
        externalId: String(order.student),
      },
      signals: opts?.tiktokSignals ?? {},
      properties: {
        contents: [{ content_id: order.course.slug, content_type: 'product', content_name: order.course.title }],
        content_type: 'product',
        value: order.amount,
        currency: order.currency ?? 'BDT',
      },
    });
```

- [ ] **Step 5: Pass `tiktokSignals` from `app/api/payment/success/route.ts`**

Add the import after the meta-capi import (line 5):

```ts
import { tiktokSignalsFromRequest } from '@/lib/tiktok-events';
```

Update BOTH `finalizeSuccessfulOrder` calls in this file to also pass `tiktokSignals`:

The already-finalized branch (line 30):

```ts
      const fin = await finalizeSuccessfulOrder(orderId, {
        signals: capiSignalsFromRequest(req),
        tiktokSignals: tiktokSignalsFromRequest(req),
      });
```

The success-outcome branch (line 77):

```ts
    const fin = await finalizeSuccessfulOrder(orderId, {
      epsTransactionId,
      signals: capiSignalsFromRequest(req),
      tiktokSignals: tiktokSignalsFromRequest(req),
    });
```

- [ ] **Step 6: Pass `tiktokSignals` from `app/api/payment/status/route.ts`**

Add the import after the meta-capi import (line 5):

```ts
import { tiktokSignalsFromRequest } from '@/lib/tiktok-events';
```

Update BOTH `finalizeSuccessfulOrder` calls in this file:

The already-success branch (line 29):

```ts
      const fin = await finalizeSuccessfulOrder(orderId, {
        signals: capiSignalsFromRequest(req),
        tiktokSignals: tiktokSignalsFromRequest(req),
      });
```

The pending→success branch (line 47):

```ts
        const fin = await finalizeSuccessfulOrder(orderId, {
          epsTransactionId: result.epsTransactionId,
          signals: capiSignalsFromRequest(req),
          tiktokSignals: tiktokSignalsFromRequest(req),
        });
```

- [ ] **Step 7: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add "app/(public)/payment/success/page.tsx" lib/order-fulfillment.ts app/api/payment/success/route.ts app/api/payment/status/route.ts
git commit -m "feat(tiktok): CompletePayment on pixel + Events API"
```

---

### Task 7: CompleteRegistration (OTP page pixel + advanced matching + Events API)

**Files:**
- Modify: `app/(auth)/auth/otp/page.tsx`
- Modify: `app/api/track/complete-registration/route.ts`

**Interfaces:**
- Consumes: `trackTikTok`, `identifyTikTok` (Task 1); `sendTikTokEvent`, `tiktokSignalsFromRequest` (Task 2).

- [ ] **Step 1: Import in `app/(auth)/auth/otp/page.tsx`**

After `import { trackPixel, setPixelAdvancedMatching } from '@/lib/meta-pixel';` (line 9):

```tsx
import { trackTikTok, identifyTikTok } from '@/lib/tiktok-pixel';
```

- [ ] **Step 2: Fire TikTok advanced-match + CompleteRegistration**

Immediately after the existing `trackPixel('CompleteRegistration', { status: true }, eventId);` line (line 118):

```tsx
      if (amDigits) identifyTikTok({ phone: phone.trim(), externalId: undefined });
      trackTikTok('CompleteRegistration', {}, eventId);
```

- [ ] **Step 3: Import in the route** `app/api/track/complete-registration/route.ts`

After the meta-capi import (line 5):

```ts
import { sendTikTokEvent, tiktokSignalsFromRequest } from '@/lib/tiktok-events';
```

- [ ] **Step 4: Send the Events API event** in the route

Immediately after the existing `await sendCapiEvent({ eventName: 'CompleteRegistration', … });` block (ends line 36), before `return NextResponse.json({ ok: true });`:

```ts
    await sendTikTokEvent({
      eventName: 'CompleteRegistration',
      eventId,
      user: {
        phone: user?.phone,
        email: user?.email,
        name: user?.name,
        externalId: String(session.user.id),
      },
      signals: tiktokSignalsFromRequest(req),
      properties: {},
    });
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add "app/(auth)/auth/otp/page.tsx" app/api/track/complete-registration/route.ts
git commit -m "feat(tiktok): CompleteRegistration on pixel + Events API"
```

---

### Task 8: ViewDemoClass custom event (demo page pixel + Events API)

**Files:**
- Modify: `app/ai-for-developers/demo/DemoClassClient.tsx`
- Modify: `app/api/track/view-demo/route.ts`

**Interfaces:**
- Consumes: `trackTikTok` (Task 1); `sendTikTokEvent`, `tiktokSignalsFromRequest` (Task 2).

- [ ] **Step 1: Import `trackTikTok` in `DemoClassClient.tsx`**

After `import { trackCustomPixel } from '@/lib/meta-pixel';` (line 8):

```tsx
import { trackTikTok } from '@/lib/tiktok-pixel';
```

- [ ] **Step 2: Fire the TikTok custom event**

Immediately after the existing `trackCustomPixel('ViewDemoClass', { ... }, eventId);` block (ends line 76):

```tsx
    trackTikTok(
      'ViewDemoClass',
      {
        contents: [{ content_id: COURSE_SLUG, content_type: 'product', content_name: courseTitle }],
        content_type: 'product',
      },
      eventId
    );
```

- [ ] **Step 3: Import in the route** `app/api/track/view-demo/route.ts`

After the meta-capi import (line 2):

```ts
import { sendTikTokEvent, tiktokSignalsFromRequest } from '@/lib/tiktok-events';
```

- [ ] **Step 4: Send the Events API event** in the route

Immediately after the existing `await sendCapiEvent({ eventName: 'ViewDemoClass', … });` block (ends line 32), before `return NextResponse.json({ ok: true });`:

```ts
    await sendTikTokEvent({
      eventName: 'ViewDemoClass',
      eventId,
      user: {},
      signals: tiktokSignalsFromRequest(req),
      properties: {
        contents: body.contentId
          ? [{ content_id: body.contentId, content_type: 'product', content_name: body.contentName }]
          : undefined,
        content_type: 'product',
      },
    });
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/ai-for-developers/demo/DemoClassClient.tsx app/api/track/view-demo/route.ts
git commit -m "feat(tiktok): ViewDemoClass custom event on pixel + Events API"
```

---

### Task 9: Full production build verification

**Files:** none (verification only).

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: build succeeds with no type or lint errors. (All TikTok code no-ops because env is unset locally — the site behaves identically to before.)

- [ ] **Step 2: Confirm no-op sanity check**

Grep-verify every TikTok call site guards on env / `window.ttq`:

Run: `grep -rn "TIKTOK_PIXEL_ID\|window.ttq\|isTikTokEventsEnabled" lib components | grep -v node_modules`
Expected: `trackTikTok`/`identifyTikTok` guard on `window.ttq`; `sendTikTokEvent` guards on `isTikTokEventsEnabled()`; `TikTokPixel` returns null without `TIKTOK_PIXEL_ID`.

- [ ] **Step 3: Final commit (if any doc/tidy changes)**

```bash
git add -A
git commit -m "chore(tiktok): finalize Pixel + Events API integration" --allow-empty
```

---

## Self-Review

**Spec coverage:** Env vars → Task 1. `lib/tiktok-pixel.ts` → Task 1. `lib/tiktok-events.ts` → Task 2. `TikTokPixel.tsx` + layout mount → Task 3. ViewContent → Task 4. InitiateCheckout (both modals + route) → Task 5. CompletePayment (success page + fulfillment + both payment routes) → Task 6. CompleteRegistration → Task 7. ViewDemoClass → Task 8. Build verification → Task 9. All spec sections covered.

**Type consistency:** `trackTikTok(event, properties?, eventId?)` and `identifyTikTok({email?,phone?,externalId?})` used identically at all client call sites. `sendTikTokEvent({eventName,eventId,user,signals,properties})` used identically at all server call sites. `TikTokSignals` produced by `tiktokSignalsFromRequest` and consumed by `finalizeSuccessfulOrder`'s new `opts.tiktokSignals`. `TikTokUserInfo` accepts the same `{phone,email,name,externalId}` object the Meta call sites already build. Consistent throughout.

**No placeholders:** every step contains complete code and exact anchor lines. No TBD/TODO.
