# WhatsApp OTP login with SMS fallback

**Date:** 2026-07-14
**Status:** Approved — implementing

## Goal

Move the passwordless login OTP from SMS (BulkSMSBD) to WhatsApp Cloud API as the
**primary** channel, while keeping the old SIM/SMS path as a **manual fallback**.
Motivation: many already-enrolled students may not have WhatsApp on the phone
number they signed up with, so SMS must remain reachable.

Builds on the existing WhatsApp Cloud API integration (webhook + admin inbox,
`lib/whatsapp.ts`). Credentials already set in env: `WHATSAPP_ACCESS_TOKEN`,
`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_APP_SECRET`.

## Channel model

- **Master switch: `NEXT_PUBLIC_WHATSAPP_OTP_ENABLED`.** Read by both the API
  route and the OTP page. OFF (default) = login OTP is SIM/SMS only — the safe
  state for deploy while the WhatsApp authentication template is still pending
  Meta approval. Flip to `true` (and rebuild) once the template is APPROVED; that
  single toggle makes WhatsApp primary and reveals the SMS fallback UI, with no
  code change. Everything below describes the ON behaviour.
- **Default = WhatsApp** (when the switch is ON). Login OTP is sent via an approved WhatsApp
  **authentication template** (free-form text is not allowed for a first-contact
  message — no open 24h window).
- **SMS = manual fallback.** On the OTP-entry step, once the 2-minute resend
  timer elapses, a secondary action appears next to "Resend OTP":
  **"SMS e OTP nao"**, which re-sends the code over the existing BulkSMS SIM flow.
- **Auto-fallback.** If the WhatsApp send call returns a definitive hard error
  (e.g. recipient not a WhatsApp user), the server immediately re-sends over SMS
  and reports which channel was actually used. If WhatsApp is not configured at
  all, it silently uses SMS. The manual button remains regardless.
- Verification is unchanged: one `OtpCode` in the DB, verified the same way no
  matter which channel delivered it. No auth/session logic changes.

## Template (authentication category)

Submitted via the WhatsApp Business Management API, not the dashboard UI.

- Endpoint: `POST /{WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`
- `name: login_otp`, `language: en`, `category: AUTHENTICATION`
- Components: BODY with `add_security_recommendation: true`, FOOTER with
  `code_expiration_minutes: 5`, BUTTONS with one `OTP` button, `otp_type: COPY_CODE`.
- Meta fixes the body copy ("*{{1}}* is your verification code."). Approval is
  Meta's decision; authentication templates are usually auto-approved quickly.

Script `scripts/submit-whatsapp-otp-template.ts` (run via `node --env-file`):
- default: create the template (idempotent — skip/report if it already exists)
- `--status`: list `login_otp` and print its approval status.

## Sending an authentication-template message

`lib/whatsapp.ts` → `sendOtpTemplate(phone, code)`:
- `POST /{PHONE_NUMBER_ID}/messages`, `type: template`, template `login_otp`,
  language `en`, body parameter = code, and the copy-code button parameter = code.
- Throws on failure so the route can decide to fall back to SMS.

## Backend — `/api/auth/send-otp`

- Accept optional `channel: 'whatsapp' | 'sms'` (default `whatsapp`).
- `whatsapp`: call `sendOtpTemplate`; on hard failure or if WhatsApp unconfigured,
  fall back to `sendOtp` (SMS). Response reports `channel` actually used.
- `sms`: call existing `sendOtp` directly (unchanged BulkSMS path).
- Rate limits (60s cooldown, 5/phone/hr, 20/ip/hr) shared across both channels.

## Frontend — OTP page (`app/(auth)/auth/otp/page.tsx`)

- `handleSendOtp(channel = 'whatsapp')`; toast reflects the returned channel
  ("WhatsApp e OTP pathano hoyeche" / "SMS e OTP pathano hoyeche").
- On the OTP step, after countdown hits 0: existing "Resend OTP" (WhatsApp) plus a
  secondary link **"WhatsApp e paw nai? SMS e OTP nao"** → `handleSendOtp('sms')`.

## New env

- `WHATSAPP_BUSINESS_ACCOUNT_ID` — WABA id (already set); documented in `.env.example`.

## Out of scope

- No change to OTP generation, verification, session/device logic, or the admin
  WhatsApp inbox. Purchase-confirmation and delete-account SMS stay on SMS.
