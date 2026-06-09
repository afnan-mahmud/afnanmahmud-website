# Purchase Confirmation SMS — Design

**Date:** 2026-06-10
**Status:** Approved (pending spec review)

## Problem

When a student completes payment, no SMS is sent — `app/api/payment/success/route.ts`
only marks the order success, grants the course, increments `enrolledCount`, and fires a
Meta CAPI `Purchase` event. The student gets no confirmation on their phone. We want a
BulkSMSBD confirmation SMS (same channel as the login OTP) sent on successful purchase.

## Components

**1. `lib/sms.ts`** (refactor) — the BulkSMSBD call is currently hardcoded inside `sendOtp`.
Extract a generic sender and add a purchase message:
- `sendSms(phone: string, message: string): Promise<boolean>` — owns the BulkSMSBD specifics
  (form-encoded params, `type=text`, `88` country-code prefix, `response_code === 202` check,
  missing-credentials → `false`). Returns `true`/`false`, never throws.
- `sendOtp(phone, code)` — now builds the OTP message and delegates to `sendSms` (unchanged
  behavior and text).
- `sendPurchaseConfirmation(phone: string, courseTitle: string): Promise<boolean>` — composes
  the confirmation message and delegates to `sendSms`.

Message text (Banglish, single SMS):
```
Obhinondon! Apnar "<courseTitle>" course er payment confirm hoyeche. Login kore class
shuru korun: <baseUrl>/dashboard — Afnan Mahmud
```
`baseUrl` is `process.env.NEXTAUTH_URL ?? 'http://localhost:3000'` (the route already derives
this).

**2. `app/api/payment/success/route.ts`** (edit) — two related changes:

- **First-transition guard.** Capture whether the order was already `success` *before* updating
  it (`const alreadyProcessed = order.status === 'success'`). Run the side-effects —
  `enrolledCount` increment, Meta CAPI `Purchase`, and the new confirmation SMS — only when
  `!alreadyProcessed`. This prevents a page refresh or a duplicate EPS redirect from
  double-counting enrollments, firing duplicate Purchase events, or sending duplicate SMS.
  Marking the order `success` and `$addToSet` of the course remain idempotent and can run
  regardless.
- **Send the SMS.** After the order is marked success (first transition only), call
  `sendPurchaseConfirmation(purchaser.phone, order.course.title)`. Awaited but **non-blocking
  for correctness**: wrap so a failure is logged and never affects enrollment or the redirect.
  Guard on `purchaser?.phone` being present.

## Data flow

```
EPS redirect → GET /api/payment/success?orderId
  → verify payment (existing)
  → alreadyProcessed = (order.status === 'success')
  → mark order success + $addToSet course   (idempotent, always)
  → if !alreadyProcessed:
       increment enrolledCount
       send Meta CAPI Purchase
       sendPurchaseConfirmation(phone, courseTitle)   // logged on failure
  → redirect to /payment/success
```

## Error handling & safety

- BulkSMSBD credentials unset → `sendSms` returns `false` (logged), redirect/enrollment
  unaffected — identical to the existing OTP no-op behavior.
- SMS send is wrapped so any error is caught and logged; the user still lands on the success
  page and keeps their course.
- The dev-bypass payment path (`epsConfigured()` false, non-prod) also reaches success and will
  attempt the SMS; with no credentials it is a logged no-op.
- BulkSMSBD also requires server-IP whitelisting (existing constraint, documented in CLAUDE.md)
  — unchanged.

## Out of scope

- Email confirmation.
- Admin/owner notification of a new sale.
- Retry/queue for failed SMS.

## Testing / acceptance (manual)

1. Complete a purchase → the buyer's phone receives the confirmation SMS once.
2. Refresh the success URL / trigger the redirect again → no second SMS, `enrolledCount` not
   double-incremented, no duplicate Purchase event.
3. With BulkSMS credentials unset (dev) → purchase still completes, course granted, only a log
   line for the skipped SMS.
4. Login OTP SMS still works unchanged (now via the shared `sendSms`).
