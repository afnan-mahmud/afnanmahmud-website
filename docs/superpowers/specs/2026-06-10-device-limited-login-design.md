# Device-Limited Login (Anti Account-Sharing) — Design

**Date:** 2026-06-10
**Status:** Approved (pending spec review)

## Problem

A paid course can be shared by handing the login to many people. We must cap each
**student** account to **one mobile + one desktop device** logged in at a time. Logging in
on a new device of the same class invalidates the previous device of that class; the old
device is logged out (with a clear message) the next time it loads a protected page.

## Requirements (confirmed)

- Cap: **1 mobile + 1 desktop** concurrently per student account (2 device classes).
- New login of a class **kicks** the previous device of that same class.
- **Admins are exempt** (no limit — they must never lock themselves out).
- **Tablet counts as mobile** (touch class).
- Enforcement happens **at protected Node boundaries** on the next page load / API call —
  not instantly — keeping the existing edge middleware untouched (mongoose can't run on
  the edge). This is exactly where paid video access is gated, so it covers the threat.

## Constraint: stateless JWT

Auth is NextAuth v5 with `session.strategy = 'jwt'`. The config is split: `lib/auth.config.ts`
is edge-safe (no DB, used by `middleware.ts`); `lib/auth.ts` holds the Credentials provider
and DB access. JWTs cannot be revoked on the edge, so we track active sessions server-side
and validate them only where the DB is reachable (Node server components and API routes).

## Core mechanism

Each login mints a unique `sessionId`, embedded in the JWT. The DB stores, per
`(userId, deviceClass)`, the currently-active `sessionId`. A new same-class login overwrites
that slot, so the previous device's `sessionId` is no longer present in the user's list.
Validation = "is this token's `sessionId` still in the user's `deviceSessions`?"

`deviceClass` is only needed at login time (which slot to overwrite). Validation checks the
`sessionId` alone, so the token need not carry the class.

## Components

**1. `models/User.ts`** (edit) — add an optional, backward-compatible field:
```ts
deviceSessions: {
  deviceClass: 'mobile' | 'desktop';
  sessionId: string;
  userAgent?: string;
  lastLogin: Date;
}[]
```

**2. `lib/device.ts`** (new) — pure helper.
- `deviceClass(userAgent: string | null | undefined): 'mobile' | 'desktop'` — mobile/tablet
  user-agent regex → `'mobile'`; everything else → `'desktop'`. No DB, no side effects.

**3. `lib/auth-device.ts`** (new, Node/DB).
- `registerDeviceSession(userId, deviceClass, userAgent): Promise<string>` — remove any existing
  `deviceSessions` entry of the same `deviceClass`, push a new `{ deviceClass, sessionId, userAgent,
  lastLogin: now }` with a freshly generated `sessionId` (`crypto.randomUUID()`), persist, return
  the `sessionId`.
- `isSessionActive(userId, role, sessionId): Promise<boolean>` — `true` when `role !== 'student'`
  (admins exempt); when `sessionId` is missing → `false` (forces a one-time re-login for tokens
  issued before this feature); otherwise `true` iff the user's `deviceSessions` contains an entry
  with that `sessionId`.

**4. `lib/auth.ts`** (edit) — in `authorize(credentials, request)`: after `verifyOtpCode` succeeds,
if the user's role is `student`, read `request.headers.get('user-agent')`, compute `deviceClass`,
call `registerDeviceSession`, and include the returned `sessionId` on the returned user object.
Admins skip registration and carry no `sessionId`.

**5. `lib/auth.config.ts`** (edit) — `jwt` callback copies `user.sessionId` → `token.sessionId` on
login; `session` callback copies `token.sessionId` → `session.user.sessionId`. Extend the
`next-auth` / `@auth/core/jwt` type declarations with the optional `sessionId`. No DB calls (stays
edge-safe). `sessionId` is an opaque UUID — exposing it to the client is harmless without the
signing secret.

**6. `app/(dashboard)/layout.tsx`** (refactor to server component) — the current client layout body
moves verbatim into a new client component **`components/layout/DashboardShell.tsx`** (keeps the
sidebar `useState`/mobile-header logic). The route-group layout becomes a server component that:
`await auth()` → if a session exists and `role === 'student'`, `await isSessionActive(id, role,
sessionId)`; on `false`, `redirect('/auth/otp?reason=other_device')`; then renders
`<DashboardShell>{children}</DashboardShell>`. One enforcement point covers every dashboard route,
including the video watch page. (Middleware already bounces admins out of `/dashboard`, so callers
here are students; the role guard is belt-and-suspenders.)

**7. `app/api/video/otp/route.ts`** (edit) — defense for the paid asset: when a session exists, also
`await isSessionActive(...)`; if `false`, return `401`. Anonymous preview requests are unaffected.

**8. OTP page (`app/(auth)/auth/otp/page.tsx`)** (edit) — when `searchParams` has
`reason=other_device`, on mount call `signOut({ redirect: false })` (next-auth/react) to clear the
stale cookie and show a toast: "Apnar account onno device e login kora hoyeche, tai ei device theke
logout kora holo." The normal phone/OTP flow is otherwise unchanged; `returnUrl` handling stays.

## Data flow

```
Login on phone B
  → authorize: deviceClass = 'mobile', registerDeviceSession overwrites the mobile slot
    (phone A's sessionId is removed), returns a new sessionId
  → token.sessionId = new ; session.user.sessionId = new

Phone A loads /dashboard (or a course/video)
  → (dashboard)/layout (server): isSessionActive(A.sessionId)? → not in DB → false
  → redirect /auth/otp?reason=other_device → cookie cleared + message
```

## Error handling & safety

- **Edge middleware untouched** — no DB on the edge; enforcement is Node-only.
- **Admin never kicked** — the role check short-circuits before any DB lookup.
- **Same-device re-login** — new `sessionId` + new cookie; seamless.
- **Mobile + desktop together** — different classes, both allowed.
- **Post-deploy:** tokens minted before this feature have no `sessionId`, so students must
  re-login once (then they are tracked). Admins are unaffected. Acceptable: the platform is new
  with no real student videos uploaded yet.
- Existing flows (enroll, payment, progress, OTP send/verify, VdoCipher playback) are unchanged.

## Out of scope (v1)

- A "manage my devices" UI or a manual "log out other device" button.
- Login history / audit log.
- A third device class.

## Testing / acceptance (manual)

1. Log in on desktop browser A → dashboard works.
2. Log in on a phone → both work simultaneously (different classes).
3. Log in on a second phone → first phone, on next dashboard/video load, is redirected to OTP
   with the "logged in on another device" message and its cookie cleared.
4. The desktop session remains active throughout (only the mobile slot was replaced).
5. An admin account can be logged in on multiple devices with no kicks.
6. Hitting `/api/video/otp` with a kicked session returns `401`.
