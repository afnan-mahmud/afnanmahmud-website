# Abandoned-enrollment WhatsApp follow-up

**Date:** 2026-07-14
**Status:** Approved — implementing

## Goal

When someone starts enrolling (submits name + phone on the landing enroll modal,
creating a `pending` Order and heading to payment) but never completes the
purchase, send them a single WhatsApp follow-up ~2-4 minutes later:

> Assalamualaikum. Amader AI powered software development course er jonno apni
> enroll korte cheyechilen, kintu enroll shofol hoy ni. Kono shomossa hoyechilo ki?

## Constraints

- Business-initiated message to a cold contact (no open 24h window) → must use an
  approved **template**, not free-form text. Category: **UTILITY** (order
  follow-up). The message has no variables, so the template is a fixed body.
  Meta may recategorize to MARKETING; the send works regardless.
- Reuses the existing WhatsApp Cloud API integration (`lib/whatsapp.ts`) and the
  proven **reconcile cron** pattern (PM2 cron app → localhost endpoint over a
  bearer secret → all logic in the Next server).

## Who gets messaged

An Order is a follow-up candidate when ALL hold:
- `status` is `pending` or `failed` (never became `success`),
- `enrollFollowupSentAt` is unset (dedupe — once per abandoned attempt),
- `createdAt` is between `MIN_AGE` (2 min) and `MAX_AGE` (60 min) ago,
- the student does **not** already own the order's course (guards against a paid
  duplicate order).

`MAX_AGE = 60 min` keeps the message timely and, crucially, stops a burst of
messages to hours-old leads the first time the feature is switched on.

## Components

- **`models/Order.ts`** — add `enrollFollowupSentAt?: Date`.
- **`lib/whatsapp.ts`** — `sendEnrollFollowup(phone)`: send the `enroll_followup`
  template (no params); throws on failure.
- **`app/api/whatsapp/abandoned-sweep/route.ts`** — POST, bearer `RECONCILE_SECRET`.
  No-op unless `WHATSAPP_ABANDONED_ENABLED === 'true'` and WhatsApp is configured.
  Sweeps candidate orders (batch-limited), sends the template, stamps
  `enrollFollowupSentAt` on success. A send failure is logged and left unstamped
  so it retries next sweep (bounded by MAX_AGE).
- **`scripts/abandoned-whatsapp.mjs`** — one-shot cron trigger, mirrors
  `scripts/reconcile-payments.mjs` (POSTs the endpoint over localhost).
- **`scripts/submit-whatsapp-followup-template.ts`** — submit / `--status` the
  UTILITY template via the WhatsApp Business Management API.
- **`ecosystem.config.js`** — new PM2 cron app `afnan-abandoned-whatsapp`,
  `cron_restart: '*/2 * * * *'`, autorestart off.

## New env

- `WHATSAPP_ABANDONED_ENABLED` — `false` (default) = sweep is a no-op. Set `true`
  once the `enroll_followup` template is APPROVED. Server-only (not NEXT_PUBLIC).
- Reuses `RECONCILE_SECRET` for the cron→endpoint auth.

## Out of scope

- No opt-out/STOP handling (UTILITY, low volume); no per-phone lifetime cap
  beyond once-per-order; no admin UI. Inbound replies land in the existing
  WhatsApp admin inbox.
