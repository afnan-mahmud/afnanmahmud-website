# Google Tag Manager (dataLayer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Load a GTM container and push GA4-friendly dataLayer events at every funnel and key-UI touchpoint, so Google Ads / GA4 conversions can be wired entirely from the GTM dashboard with no further code changes.

**Architecture:** A small client helper (`lib/gtm.ts`) exposes `pushToDataLayer(event, params)` and event-name constants; a `<GoogleTagManager />` component loads the container and pushes `page_view` on route changes. Funnel touchpoints that already fire Meta Pixel events get a parallel `pushToDataLayer` call reusing the same `event_id`. Meta Pixel/CAPI code is left untouched (coexist).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next/script`.

## Global Constraints

- **No test framework exists** in this repo. Each task's verification cycle is: implement → `npm run build` (must pass) → manual runtime check (DOM / `window.dataLayer` console inspection / GTM Preview) → commit. There are no automated test files to write.
- **No-op when unconfigured:** when `NEXT_PUBLIC_GTM_ID` is unset, the container must not load and every `pushToDataLayer` call must be a silent no-op. Existing Meta flows must be unaffected.
- **SSR-safe:** every dataLayer access guards on `typeof window !== 'undefined'`.
- **Do not modify** `lib/meta-pixel.ts`, `lib/meta-capi.ts`, or `components/tracking/MetaPixel.tsx`.
- **No PII in URLs.** Phone for Enhanced Conversions is read from `localStorage`/session client-side, never added to query strings.
- Env var name is exactly `NEXT_PUBLIC_GTM_ID`; container id format `GTM-XXXXXXX`.
- Reuse existing `event_id` values for dedup — never mint a new one where one already exists.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `lib/gtm.ts` | Create | `GTM_ID`, `pushToDataLayer`, `GTM_EVENT` constants. SSR-safe, no-op when unset. |
| `components/tracking/GoogleTagManager.tsx` | Create | GTM container `<Script>` + `<noscript>`, route-change `page_view`. |
| `app/layout.tsx` | Modify | Mount `<GoogleTagManager />` beside `<Clarity />`. |
| `.env.example` | Modify | Document `NEXT_PUBLIC_GTM_ID`. |
| `components/tracking/ViewContentTracker.tsx` | Modify | Push `view_item`. |
| `app/ai-for-developers/demo/DemoClassClient.tsx` | Modify | Push `view_demo_class` + `demo_play`. |
| `app/ai-for-developers/EnrollModal.tsx` | Modify | Push `begin_checkout`, `enroll_click`, `form_start`. |
| `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx` | Modify | Push `begin_checkout`, `enroll_click`, `form_start`. |
| `app/api/payment/success/route.ts` | Modify | Add `txn` (order id) to success redirect params. |
| `app/(public)/payment/success/page.tsx` | Modify | Push `purchase` (with `transaction_id` + `user_data.phone` from localStorage). |
| `app/(auth)/auth/otp/page.tsx` | Modify | Push `sign_up` (with `user_data.phone`). |
| `components/VdoPlayer.tsx` | Modify | Add optional `onReady` callback (fires once when player is ready). |

---

## Task 1: Foundation — helper, container, env, layout mount

**Files:**
- Create: `lib/gtm.ts`
- Create: `components/tracking/GoogleTagManager.tsx`
- Modify: `app/layout.tsx`
- Modify: `.env.example`

**Interfaces:**
- Produces:
  - `GTM_ID: string | undefined`
  - `pushToDataLayer(event: string, params?: Record<string, unknown>): void`
  - `GTM_EVENT` — const object: `{ pageView, viewItem, viewDemoClass, beginCheckout, purchase, signUp, enrollClick, formStart, demoPlay }` mapping to the snake_case event strings.
  - `<GoogleTagManager />` default export (client component).

- [ ] **Step 1: Create `lib/gtm.ts`**

```ts
// Client-side Google Tag Manager dataLayer helpers. Every call is a safe no-op
// when NEXT_PUBLIC_GTM_ID is unset or when run during SSR. GTM itself is the
// event hub: this file only loads events into window.dataLayer; Google Ads / GA4
// tags are wired in the GTM dashboard.

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

type DataLayerObject = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerObject[];
  }
}

/** Canonical dataLayer event names (GA4-friendly). Use these, never raw strings. */
export const GTM_EVENT = {
  pageView: 'page_view',
  viewItem: 'view_item',
  viewDemoClass: 'view_demo_class',
  beginCheckout: 'begin_checkout',
  purchase: 'purchase',
  signUp: 'sign_up',
  enrollClick: 'enroll_click',
  formStart: 'form_start',
  demoPlay: 'demo_play',
} as const;

/** Push an event + params into window.dataLayer. No-op on SSR or when GTM is unset. */
export function pushToDataLayer(event: string, params: DataLayerObject = {}): void {
  if (typeof window === 'undefined') return;
  if (!GTM_ID) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
```

- [ ] **Step 2: Create `components/tracking/GoogleTagManager.tsx`**

```tsx
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { GTM_ID, GTM_EVENT, pushToDataLayer } from '@/lib/gtm';

function GtmPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Mirror MetaPixel: push page_view on every client-side route change. The
    // base snippet fires gtm.js once on load; GTM's own Page View trigger can
    // also key off this custom event for SPA navigations.
    pushToDataLayer(GTM_EVENT.pageView, { page_path: pathname });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Loads the Google Tag Manager container and tracks page_view across
 * navigations. Renders nothing when NEXT_PUBLIC_GTM_ID is unset.
 */
export default function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <>
      <Script id="gtm-base" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <Suspense fallback={null}>
        <GtmPageView />
      </Suspense>
    </>
  );
}
```

- [ ] **Step 3: Mount in `app/layout.tsx`**

Add the import next to the existing Clarity import:

```tsx
import Clarity from "@/components/tracking/Clarity";
import GoogleTagManager from "@/components/tracking/GoogleTagManager";
```

Render it right after `<Clarity />` inside `<body>`:

```tsx
        <MetaPixel />
        <Clarity />
        <GoogleTagManager />
        <SessionProvider>
```

- [ ] **Step 4: Document the env var in `.env.example`**

Add this line in the analytics/tracking section (near `NEXT_PUBLIC_META_PIXEL_ID`):

```
# Google Tag Manager container id (GTM-XXXXXXX). Unset = GTM disabled (no-op).
NEXT_PUBLIC_GTM_ID=
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: build succeeds with no type errors.

- [ ] **Step 6: Manual runtime check**

With `NEXT_PUBLIC_GTM_ID` **unset**: `npm run dev`, open the site, view source / Elements — confirm there is **no** `gtm.js` script and no `ns.html` iframe, and that `window.dataLayer` pushes do nothing (Meta Pixel still works).
Then set `NEXT_PUBLIC_GTM_ID=GTM-TEST123` in `.env.local`, restart dev, reload — confirm the `gtm-base` script tag is present and `window.dataLayer` contains a `gtm.js` entry, and navigating between pages adds `{event: 'page_view', page_path: ...}` entries (inspect `window.dataLayer` in the console).

- [ ] **Step 7: Commit**

```bash
git add lib/gtm.ts components/tracking/GoogleTagManager.tsx app/layout.tsx .env.example
git commit -m "feat: add GTM container and dataLayer helper"
```

---

## Task 2: View events — `view_item` and `view_demo_class`

**Files:**
- Modify: `components/tracking/ViewContentTracker.tsx`
- Modify: `app/ai-for-developers/demo/DemoClassClient.tsx`

**Interfaces:**
- Consumes: `pushToDataLayer`, `GTM_EVENT` from `lib/gtm.ts`.

- [ ] **Step 1: Push `view_item` in `ViewContentTracker.tsx`**

Add the import at the top with the existing imports:

```ts
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';
```

Inside the existing `useEffect`, immediately after the `trackPixel('ViewContent', customData, eventId);` line, add (reusing the same `eventId`):

```ts
    pushToDataLayer(GTM_EVENT.viewItem, {
      content_id: contentId,
      content_name: contentName,
      value,
      currency,
      event_id: eventId,
    });
```

- [ ] **Step 2: Push `view_demo_class` in `DemoClassClient.tsx`**

Add the import alongside the existing `trackCustomPixel` import:

```ts
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';
```

Inside the existing `useEffect`, immediately after the `trackCustomPixel('ViewDemoClass', …, eventId);` call, add (reusing the same `eventId`):

```ts
    pushToDataLayer(GTM_EVENT.viewDemoClass, {
      content_id: COURSE_SLUG,
      content_name: courseTitle,
      event_id: eventId,
    });
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Manual runtime check**

With a test `NEXT_PUBLIC_GTM_ID` set: open a course page (`/courses/<slug>`) and the AI landing — confirm `window.dataLayer` gets a `view_item` entry with `content_id`, `value`, `currency`, `event_id`. Open `/ai-for-developers/demo` — confirm a `view_demo_class` entry. Verify the `event_id` matches the one in the corresponding Meta pixel call (same value).

- [ ] **Step 5: Commit**

```bash
git add components/tracking/ViewContentTracker.tsx app/ai-for-developers/demo/DemoClassClient.tsx
git commit -m "feat: push view_item and view_demo_class to dataLayer"
```

---

## Task 3: Conversion events — `begin_checkout`, `purchase`, `sign_up`

**Files:**
- Modify: `app/ai-for-developers/EnrollModal.tsx`
- Modify: `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx`
- Modify: `app/api/payment/success/route.ts`
- Modify: `app/(public)/payment/success/page.tsx`
- Modify: `app/(auth)/auth/otp/page.tsx`

**Interfaces:**
- Consumes: `pushToDataLayer`, `GTM_EVENT` from `lib/gtm.ts`.

- [ ] **Step 1: Push `begin_checkout` in both `EnrollModal.tsx` files**

In **each** of the two files, add the import next to the existing `trackPixel` import:

```ts
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';
```

Inside `handleSubmit`, within the existing `if (data.eventId) { trackPixel('InitiateCheckout', …) }` block, immediately after the `trackPixel(...)` call, add (reusing `data.eventId`):

```ts
          pushToDataLayer(GTM_EVENT.beginCheckout, {
            content_id: data.contentId,
            content_name: data.contentName,
            value: data.value,
            currency: data.currency ?? 'BDT',
            event_id: data.eventId,
          });
```

- [ ] **Step 2: Add `txn` to the success redirect in `app/api/payment/success/route.ts`**

In the `successParams` construction (currently `course`, `title`, `eid`, `value`, `currency`), add the order id as the Google Ads `order_id` dedup key:

```ts
    const successParams = new URLSearchParams({
      course: order.course.slug,
      title: order.course.title,
      eid: eventId,
      value: String(order.amount),
      currency: order.currency ?? 'BDT',
      txn: orderId,
    });
```

(`orderId` is already in scope from `searchParams.get('orderId')` at the top of the handler.)

- [ ] **Step 3: Push `purchase` in `app/(public)/payment/success/page.tsx`**

Add the import:

```ts
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';
```

Read the new `txn` param alongside the existing param reads:

```ts
  const txn = searchParams.get('txn') ?? undefined;
```

Inside the existing `useEffect` (after the `trackPixel('Purchase', …, eid)` call), add the dataLayer push. Source the phone from the same `localStorage` key the EnrollModal writes (`devc_enroll_retry`), normalized to `8801XXXXXXXXX`, with no PII ever placed in the URL:

```ts
    let phone: string | undefined;
    try {
      const saved = localStorage.getItem('devc_enroll_retry');
      if (saved) {
        const digits = (JSON.parse(saved) as { phone?: string }).phone?.replace(/\D/g, '');
        if (digits) phone = digits.startsWith('88') ? digits : `88${digits}`;
      }
    } catch { /* ignore unavailable/malformed storage */ }

    pushToDataLayer(GTM_EVENT.purchase, {
      content_id: courseSlug || undefined,
      content_name: courseTitle,
      value: value ? Number(value) : undefined,
      currency,
      transaction_id: txn,
      event_id: eid,
      ...(phone ? { user_data: { phone } } : {}),
    });
```

- [ ] **Step 4: Push `sign_up` in `app/(auth)/auth/otp/page.tsx`**

Add the import:

```ts
import { pushToDataLayer, GTM_EVENT } from '@/lib/gtm';
```

Immediately after the existing `trackPixel('CompleteRegistration', { status: true }, eventId);` line (where `amPhone` and `eventId` are already in scope), add:

```ts
      pushToDataLayer(GTM_EVENT.signUp, {
        event_id: eventId,
        ...(amDigits ? { user_data: { phone: amPhone } } : {}),
      });
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Manual runtime check**

With a test `NEXT_PUBLIC_GTM_ID` set:
- Submit the enroll modal → confirm a `begin_checkout` dataLayer entry with `value`, `currency`, `event_id` matching the Meta `InitiateCheckout`.
- Complete the dev-bypass payment flow → on `/payment/success`, confirm a `purchase` entry with `transaction_id` (the order id), `event_id`, and `user_data.phone` = `8801…` (when the enroll localStorage is present).
- Complete OTP login → confirm a `sign_up` entry with `event_id` and `user_data.phone`.

- [ ] **Step 7: Commit**

```bash
git add "app/ai-for-developers/EnrollModal.tsx" "app/(public)/mobile-app-development-by-ai/EnrollModal.tsx" "app/api/payment/success/route.ts" "app/(public)/payment/success/page.tsx" "app/(auth)/auth/otp/page.tsx"
git commit -m "feat: push begin_checkout, purchase, sign_up to dataLayer with enhanced-conversion phone"
```

---

## Task 4: Key UI interactions — `enroll_click`, `form_start`, `demo_play`

**Files:**
- Modify: `app/ai-for-developers/EnrollModal.tsx`
- Modify: `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx`
- Modify: `components/VdoPlayer.tsx`
- Modify: `app/ai-for-developers/demo/DemoClassClient.tsx`

**Interfaces:**
- Consumes: `pushToDataLayer`, `GTM_EVENT` from `lib/gtm.ts`.
- Produces: `VdoPlayer` gains an optional prop `onReady?: () => void` (called once when the player becomes ready). Existing call sites that omit it are unaffected.

- [ ] **Step 1: Push `enroll_click` + `form_start` in both `EnrollModal.tsx` files**

(`pushToDataLayer`/`GTM_EVENT` are already imported from Task 3. `COURSE_SLUG` is defined at the top of each file.)

Add a ref next to the existing `nameRef` declaration:

```ts
  const formStarted = useRef(false);
```

In the existing `useEffect(() => { if (open) { … } }, [open])`, at the very start of the `if (open) {` block, add the enroll_click push and reset the form-start guard:

```ts
    if (open) {
      pushToDataLayer(GTM_EVENT.enrollClick, { content_id: COURSE_SLUG });
      formStarted.current = false;
```

Add a focus handler above the `return` (near `handleSubmit`):

```ts
  function handleFormStart() {
    if (formStarted.current) return;
    formStarted.current = true;
    pushToDataLayer(GTM_EVENT.formStart, { content_id: COURSE_SLUG });
  }
```

Add `onFocus={handleFormStart}` to both the name and phone `<input>` elements (the name input already has `ref={nameRef}`).

- [ ] **Step 2: Add optional `onReady` to `components/VdoPlayer.tsx`**

Update the signature:

```tsx
export default function VdoPlayer({ videoId, title, onReady }: { videoId: string; title?: string; onReady?: () => void }) {
```

Add an effect that fires `onReady` once per video when the player reaches the ready state. Place it just after the `state` is computed (after the `const state = …` block):

```tsx
  const readyFired = useState(() => ({ done: false }))[0];
  useEffect(() => {
    if (state.status === 'ready' && !readyFired.done) {
      readyFired.done = true;
      onReady?.();
    }
  }, [state.status, onReady, readyFired]);
```

(`useEffect` and `useState` are already imported in this file.)

- [ ] **Step 3: Push `demo_play` from `DemoClassClient.tsx`**

(`pushToDataLayer`/`GTM_EVENT` already imported from Task 2.) On the `<VdoPlayer videoId={demo.videoId} title={demo.title} />` usage, add the `onReady` handler:

```tsx
                  <VdoPlayer
                    videoId={demo.videoId}
                    title={demo.title}
                    onReady={() =>
                      pushToDataLayer(GTM_EVENT.demoPlay, {
                        content_id: COURSE_SLUG,
                        content_name: courseTitle,
                      })
                    }
                  />
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Manual runtime check**

With a test `NEXT_PUBLIC_GTM_ID` set:
- Click any "Enroll" CTA → confirm one `enroll_click` entry appears in `window.dataLayer` when the modal opens.
- Focus the name or phone field → confirm exactly one `form_start` entry (does not repeat on a second focus).
- Open the demo page and let the player load → confirm one `demo_play` entry once the video is ready. Confirm the existing dashboard lesson player (which omits `onReady`) still plays without errors.

- [ ] **Step 6: Commit**

```bash
git add "app/ai-for-developers/EnrollModal.tsx" "app/(public)/mobile-app-development-by-ai/EnrollModal.tsx" components/VdoPlayer.tsx app/ai-for-developers/demo/DemoClassClient.tsx
git commit -m "feat: push enroll_click, form_start, demo_play UI events to dataLayer"
```

---

## Post-implementation: GTM dashboard setup (no code)

These are one-time manual steps in the GTM web UI — documented here for the operator, not part of the code tasks:

1. Create a GTM container; put its id into `.env.local` as `NEXT_PUBLIC_GTM_ID`, redeploy.
2. Add a Google Ads Conversion Tracking tag, trigger = Custom Event `purchase`; map `value`, `currency`, `transaction_id`.
3. Enable Enhanced Conversions on that tag; map `user_data.phone`.
4. (Optional) GA4 config + GA4 event tags for `view_item`, `begin_checkout`, `purchase`, `sign_up`.
5. (Optional) Built-in Scroll Depth (25/50/75/100) and Click triggers for behavioral signals — no app code needed.
6. New campaigns/conversions later → add tags in GTM only.
