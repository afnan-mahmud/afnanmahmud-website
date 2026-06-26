# Checkout Conversion Improvements — Design

**Date:** 2026-06-27
**Status:** Approved (brainstorming)

## Problem

Some users drop off at the checkout (enroll) form. Improving form UX,
validation, payment-failure handling, and adding a progress indicator should
lift conversion.

## Current state

- The "checkout form" is the **`EnrollModal`** (name + phone). It exists in two
  near-identical copies with different themes:
  - `app/ai-for-developers/EnrollModal.tsx` — dark neon theme (cyan/indigo).
  - `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx` — light theme
    (accent `#625fff`).
- Both POST to `/api/enroll/landing`, then `window.location.href = paymentUrl`
  (EPS hosted page).
- Validation today: only non-empty client checks; the BD phone format is
  validated **server-side**, so the user only sees a format error *after*
  submitting.
- Loading: submit button text swaps to "অপেক্ষা করো...".
- Payment failure: `/payment/failed` page with `REASON_MESSAGES`, a "Try Again"
  link (→ course page, only if `course` param present), and a "Contact Support"
  link. Contact targets are **placeholders** (`wa.me/8801XXXXXXXXX`,
  `support@devcourses.bd`).
- No progress indicator anywhere.

## Decision

Keep the two modals **separate** (no unification refactor); apply the same set
of improvements to both, themed to each. No backend / API / schema changes.

## Scope of changes

### 1. Funnel stepper (progress indicator)

A small 3-step indicator above each modal's header:

```
● Enroll  ──  ○ Payment  ──  ○ Access
```

- "Enroll" active; "Payment" and "Access" inactive.
- The form stays single-step — the stepper only provides context (reassures the
  user that course access comes after payment) and builds trust.
- Styled per modal theme: cyan/indigo for ai-for-developers, `#625fff` for
  mobile-app.

### 2. Form UX + inline validation

- **Real-time, field-level validation** (replacing / alongside the single error
  box):
  - **Name:** required, trimmed, min 2 chars. Inline error below the field when
    invalid (only after the field has been touched/blurred).
  - **Phone:** strip non-digits as the user types; live-validate
    `^01[3-9]\d{8}$`. Inline hint below the field when invalid.
    `inputMode="numeric"`, `maxLength={11}` (already present).
- **Submit disabled** until both fields are valid.
- **Loading state:** after submit, the button shows a spinner + "Securing your
  spot..." so the user understands work is happening before the redirect.
- Server/network errors keep using the existing red error box.

### 3. Payment failure handling (`app/(public)/payment/failed/page.tsx`)

- **Seamless retry (prefill):**
  - On submit, the modal saves `{ name, phone }` to `localStorage` under key
    `devc_enroll_retry`.
  - The failed page's "Try Again" button links to the relevant **landing page**
    with `?retry=1` (instead of the generic course page). A slug→path map
    resolves the `course` search param:
    - `ai-for-developers` → `/ai-for-developers`
    - `complete-website-and-mobile-application-development-course-by-ai` →
      `/mobile-app-development-by-ai`
    - Fallback (unknown/empty slug): `/` (home) or the course page if a slug is
      present, preserving today's behavior.
  - On `?retry=1`, the landing page auto-opens its modal; the modal reads
    `devc_enroll_retry` from `localStorage` on open and prefills name + phone so
    the user doesn't retype.
- **Real support contact:** replace the placeholder with
  `https://wa.me/8801791225000`. Remove the email branch — all reasons use
  WhatsApp. (No support email per product decision.)
- **Clearer, actionable reasons:** extend `REASON_MESSAGES` so each reason
  carries a short next-step, e.g.:
  - `insufficient_funds` → "Payment declined due to insufficient balance. Check
    your balance and try again."
  - `payment_cancelled` → "You cancelled the payment. You can try again anytime."
  - `verification_failed` → "We could not verify your payment. If you were
    charged, contact support on WhatsApp."

### 4. Integration (minimal page changes)

Each landing page adds a small client `useEffect` that opens the enroll modal
when `?retry=1` is present:

- `app/ai-for-developers/page.tsx` — calls `setEnrollOpen(true)`.
- `app/(public)/mobile-app-development-by-ai/CourseOutlineClient.tsx` — calls
  `setEnrollOpen(true)`.

Reading the query param uses `next/navigation` `useSearchParams` (client
components). Both pages already manage `enrollOpen` via `useState`.

## Files touched

- `app/ai-for-developers/EnrollModal.tsx`
- `app/(public)/mobile-app-development-by-ai/EnrollModal.tsx`
- `app/ai-for-developers/page.tsx`
- `app/(public)/mobile-app-development-by-ai/CourseOutlineClient.tsx`
- `app/(public)/payment/failed/page.tsx`

No changes to `/api/enroll/landing`, EPS, models, or DB.

## Data flow (retry)

```
EnrollModal submit
  → localStorage["devc_enroll_retry"] = {name, phone}
  → POST /api/enroll/landing → EPS hosted page
       └─ failure → /payment/failed?reason=...&course=<slug>
            └─ "Try Again" → /<landing-path>?retry=1
                 └─ landing useEffect: setEnrollOpen(true)
                      └─ modal onOpen: prefill from localStorage["devc_enroll_retry"]
```

## Non-goals / YAGNI

- No unification of the two modals into a shared component.
- No multi-step form (single step + stepper only).
- No backend, EPS, or schema changes.
- No in-modal payment (EPS is a hosted redirect; failure stays a page).

## Testing

No test framework configured. Manual verification:
- Invalid phone → inline error, submit disabled; valid phone → enabled.
- Submit → loading state shows before redirect.
- Stepper renders correctly in both themes.
- Simulated failure (`/payment/failed?reason=insufficient_funds&course=ai-for-developers`)
  → "Try Again" reopens the correct landing modal with name+phone prefilled.
- WhatsApp link points to `wa.me/8801791225000`.
