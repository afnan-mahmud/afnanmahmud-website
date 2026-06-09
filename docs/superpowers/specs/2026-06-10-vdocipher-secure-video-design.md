# VdoCipher Secure Video Playback — Design

**Date:** 2026-06-10
**Status:** Approved (pending spec review)

## Problem

Course videos are currently embedded straight from YouTube
(`https://www.youtube.com/embed/${videoId}`) in three places: the enrolled-student
player (`components/dashboard/VideoPlayer.tsx`), the admin media preview
(`components/admin/course-form/MediaTab.tsx`), and the public course page
(`app/(public)/courses/[slug]/page.tsx`). For a **paid** course this is unsafe:

- YouTube Private only allows ~50 invited Google accounts — unusable for OTP-login students.
- YouTube Unlisted links can be shared and the video downloaded with `yt-dlp`.
- No download protection, no per-viewer traceability, no DRM.

We are moving all course video hosting to **VdoCipher**, which provides Widevine/FairPlay
DRM, download prevention, and a native **dynamic watermark** that burns the viewer's
phone number moving across the screen — so leaks are traceable to the buyer.

## Goal

Replace YouTube embeds with VdoCipher secure playback everywhere, gated by course
ownership, with the buyer's phone number rendered as a moving watermark. Do not break
any existing flow (enroll, payment, progress, auth, uploads).

## Confirmed assumptions

- **(A)** Admin uploads videos in the VdoCipher dashboard and pastes the returned
  **Video ID** into the lesson's video field — same workflow as the current YouTube ID
  field. No in-admin direct-upload UI in v1 (possible phase 2).
- **(B)** No real course videos exist yet — no migration needed. Real VdoCipher IDs are
  added as videos are uploaded.

## How VdoCipher works (verified against docs)

- **OTP API:** `POST https://dev.vdocipher.com/api/videos/{videoId}/otp`
  - Header: `Authorization: Apisecret <VDOCIPHER_API_SECRET>` (server-side only)
  - Body: `{ "ttl": <seconds>, "annotate": "<double-serialized JSON string>" }`
  - Response: `{ "otp": "...", "playbackInfo": "..." }`
- **Watermark (`annotate`):** a JSON **array** that must be `JSON.stringify`-ed into a
  string before being placed in the body. `type:'rtext'` = moving text. Example element:
  `{ type:'rtext', text:'<phone>', alpha:'0.60', color:'0xFFFFFF', size:'15', interval:'4000', skip:'2000' }`.
  VdoCipher itself renders and moves the watermark — no client-side DOM overlay needed.
- **Embed:** iframe `https://player.vdocipher.com/v2/?otp={otp}&playbackInfo={playbackInfo}`.
  DRM and download-prevention are automatic.
- The lesson's stored `videoId` is exactly the Video ID shown in the VdoCipher dashboard.

## Architecture

The `videoId` (and `previewVideoId`) fields keep their type (string) — only their
**meaning** changes from a YouTube ID to a VdoCipher Video ID. No schema migration.

### Components

**1. `lib/vdocipher.ts`** (new) — mirrors the config-gated style of `lib/eps.ts`.
- `vdocipherConfigured(): boolean` — true when `VDOCIPHER_API_SECRET` is set.
- `buildWatermark(label: string): string` — returns the double-serialized `annotate`
  string for a single moving `rtext` element showing `label` (the buyer's phone).
- `getOtp(videoId: string, opts?: { annotate?: string; ttl?: number }): Promise<{ otp: string; playbackInfo: string }>`
  — POSTs to the OTP endpoint with the `Apisecret` header; throws a clear error on a
  non-2xx response. Default `ttl` ~300s.
- The API secret is read from `process.env` inside this module and never exported or
  sent to the client.

**2. `app/api/video/otp/route.ts`** (new) — `POST { videoId }`. Defense-in-depth gate.
- Load session via `auth()` and `connectDB()`.
- Resolve the `videoId` against the DB: find the published course whose curriculum
  contains a lesson with this `videoId`, OR whose `previewVideoId` equals it. Capture
  whether the matching lesson is `isPreview`, or whether it is a course `previewVideoId`.
- **Authorization:**
  - Paid lesson (not preview): require a logged-in user **and** that the owning course's
    `_id` is in `user.purchasedCourses`. Otherwise `403`.
  - Preview lesson / course `previewVideoId`: allowed without purchase; login optional.
- **Watermark:** if a session exists, build the watermark from the user's phone; for
  anonymous preview viewers, use a neutral label (e.g. the site name) — never leak another
  user's data.
- If `videoId` is not found in any published course → `404` (prevents using our endpoint
  as an open proxy to arbitrary VdoCipher videos).
- If `!vdocipherConfigured()` → respond `503` with a clear `{ error }` message; do not throw.
- On success return `{ otp, playbackInfo }`.

**3. `components/dashboard/VideoPlayer.tsx`** (edit) — replace the YouTube `<iframe>`.
- Accept a new prop `studentPhone: string`.
- On `activeLesson` change, `POST /api/video/otp` with the lesson's `videoId`; store
  `{ otp, playbackInfo }` in state keyed to the lesson.
- Render `https://player.vdocipher.com/v2/?otp=...&playbackInfo=...` in the existing
  16:9 responsive container. Show a loading state while fetching and a friendly error
  state (e.g. "Video could not be loaded") on failure — never a blank crash.
- Remove the YouTube-specific embed params. The `key={activeLesson._id}` remount pattern
  stays so switching lessons re-initializes the player.
- The "Mark as Complete" button's `disabled` condition currently depends on
  `activeLesson?.videoId`; keep that semantics.

**4. `app/(dashboard)/dashboard/my-courses/[slug]/page.tsx`** (edit)
- Also select the user's `phone` and pass it to `VideoPlayer` as `studentPhone`, so the
  watermark shows the buyer's number. Ownership redirect logic is unchanged.

**5. Preview playback** (public) — a small client component `components/VdoPreviewPlayer.tsx`.
- Used by `app/(public)/courses/[slug]/page.tsx` for `previewVideoId` and by any free
  preview lesson surface. It calls the same `/api/video/otp` endpoint (which allows
  preview videos without ownership) and renders the VdoCipher iframe. Falls back to a
  placeholder when no preview is configured.

**6. Admin labels** (edit) — copy-only, no behavior change.
- `components/admin/course-form/LessonRow.tsx`: field label "YouTube ID" → "VdoCipher
  Video ID"; placeholder updated to a VdoCipher-style ID.
- `components/admin/course-form/MediaTab.tsx`: "Preview Video ID (YouTube)" → "Preview
  Video ID (VdoCipher)"; the inline preview `<iframe>` switches to `VdoPreviewPlayer`
  (or a simple note) instead of the YouTube embed.

**7. Env / docs** (edit)
- `.env.example`: add `VDOCIPHER_API_SECRET=` with a comment.
- `CLAUDE.md`: add a short subsection describing VdoCipher playback (OTP flow, watermark,
  ownership gating) alongside the existing integration notes.

## Data flow

```
Student opens lesson
  → VideoPlayer POST /api/video/otp { videoId }
    → server: auth() + connectDB()
    → resolve videoId in DB; check ownership (or preview)
    → buildWatermark(user.phone)
    → VdoCipher OTP API (Apisecret)
    → { otp, playbackInfo }
  → iframe player.vdocipher.com/v2/?otp=&playbackInfo=
    → DRM-protected stream + moving phone watermark
```

## Error handling & safety

- **Not configured (dev):** OTP endpoint returns `503` with a message; players show a
  clear "video not configured / could not load" state. Nothing crashes. Mirrors the EPS
  dev-bypass philosophy of degrading gracefully when env is unset.
- **Defense in depth:** the watch page already redirects non-owners; the OTP endpoint
  *also* re-checks ownership server-side, so even a leaked `videoId` cannot be played by a
  non-buyer.
- **No open proxy:** `videoId` is always validated against published-course data before an
  OTP is minted.
- **Secret hygiene:** `VDOCIPHER_API_SECRET` is server-only (never `NEXT_PUBLIC_`); OTPs are
  short-lived (`ttl`).
- **Untouched flows:** enroll, payment (EPS), progress, auth, and image uploads are not
  modified. `videoId` remains a string, so the `Course` model and seed scripts are unaffected.

## Out of scope (v1)

- In-admin direct upload to VdoCipher (paste-ID workflow only).
- Bulk migration of existing videos (none exist).
- Per-lesson watermark customization beyond the buyer's phone number.

## Testing / acceptance

Manual verification after implementation (matches the user's planned test):

1. Upload a video to VdoCipher, wait for "Ready", paste its Video ID into a lesson.
2. As an enrolled student, open the lesson → video plays with the moving phone watermark.
3. As a non-owner, hitting the OTP endpoint for that `videoId` returns `403`.
4. Attempting to download via browser tools fails (DRM).
5. A preview lesson / `previewVideoId` plays without purchase.
6. With `VDOCIPHER_API_SECRET` unset, the player shows a clean "not configured" message
   rather than crashing.
