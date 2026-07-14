# Self-Service Account Deletion (`/delete`) — Design

**Date:** 2026-07-14
**Status:** Approved for planning

## Purpose

Give a student a self-service way to permanently delete their own account.
The student proves ownership of the phone number via an OTP sent to that number,
then their `User` record is removed from the site.

## User Flow

Two-step UI at `/delete`:

1. **Enter number.** Student types their own BD phone number (`01XXXXXXXXX`) and
   ticks a warning checkbox acknowledging the deletion is permanent and cannot be
   undone. Clicks **Delete request** → step 2.
2. **Send OTP.** Server validates the phone, checks whether a `User` with that
   phone exists. If it exists, it creates an `OtpCode` and sends the code by SMS.
   **If no account exists, no SMS is sent**, but the UI shows the same generic
   "OTP sent" message (prevents phone-number enumeration and SMS-cost abuse).
3. **Enter OTP.** Student reads the code from their phone and enters it, clicks
   **Confirm delete**.
4. **Verify + delete.** Server verifies phone+OTP (5-min expiry, 5-attempt cap),
   and on success deletes the `User` document and cleans up the phone's
   `OtpCode` records.
5. **Done.** UI shows a success state: "Apnar account delete hoye geche." If the
   student happened to be logged in on this device, the JWT becomes stale
   (User gone → next authenticated request redirects to `/auth/otp`). No extra
   sign-out handling required.

## Deletion Scope

- **Deleted:** the `User` document only. Because `progress`, `deviceSessions`,
  and `purchasedCourses` are embedded in / referenced from the `User`, they are
  removed together with it.
- **Retained:** `Order` / payment records (kept for accounting/legal). They are
  not anonymized in this iteration.

## Architecture

Reuse existing primitives (`OtpCode` model, `sendSms` from `lib/sms.ts`,
`rateLimit`/`clientIp` from `lib/rate-limit.ts`). Do **not** reuse the login OTP
path: `verifyOtpCode` in `lib/auth.ts` *creates* a user when none exists, which
is exactly wrong for a delete flow. Delete gets its own endpoints.

### New files

- `app/(public)/delete/page.tsx` — client component. Bilingual (Bangla/English),
  two-step form with the permanence warning + checkbox. Rendered under the
  `(public)` route group so it gets the marketing header/footer.
- `app/api/account/delete/send-otp/route.ts` — `POST`.
- `app/api/account/delete/confirm/route.ts` — `POST`.

### `POST /api/account/delete/send-otp`

- Body: `{ phone }`.
- Validate BD phone format (`/^01[3-9]\d{8}$/`).
- Rate limit (same pattern as login send-otp): 1/60s cooldown per phone,
  5/hour per phone, 20/hour per client IP.
- `connectDB()`, look up `User.findOne({ phone })`.
  - If found: `OtpCode.deleteMany({ phone })`, create a fresh 6-digit code
    (`crypto.randomInt`, 5-min expiry), `sendSms` the delete-specific message.
  - If not found: skip SMS entirely.
- Always return the same generic `{ success: true }` response.

### `POST /api/account/delete/confirm`

- Body: `{ phone, otp }`.
- String-type guard on both fields (NoSQL-injection defense, mirroring
  `verifyOtpCode`).
- Validate BD phone format.
- Find a live, unused `OtpCode` for the phone; enforce the 5-attempt cap and
  burn the code on cap — same logic as `verifyOtpCode`, but **never create a
  user**.
- On correct code: mark the OTP used, `User.deleteOne({ phone })`,
  `OtpCode.deleteMany({ phone })`.
- Return `{ success: true }` on delete, generic error otherwise.

## Security Notes

- OTP is only ever sent to the account's own phone → ownership proof.
- No account enumeration: identical response whether or not an account exists.
- 5-minute OTP expiry, 5 wrong-guess cap, rate limiting on both routes.
- Strict string typing on credentials to avoid NoSQL operator injection.
- Confirm route never auto-creates users.

## Out of Scope (YAGNI)

- Order anonymization / deletion.
- Admin-initiated deletion of other users.
- Soft delete / grace period / undo.
- Email confirmation (site is phone-first).
