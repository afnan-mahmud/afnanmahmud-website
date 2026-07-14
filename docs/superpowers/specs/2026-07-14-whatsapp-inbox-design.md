# WhatsApp Inbox — Design Spec

**Date:** 2026-07-14
**Status:** Approved, ready for implementation

## Goal

Let visitors reach the business on WhatsApp from the `ai-for-developers` landing
page, and give admins a full two-way WhatsApp inbox inside the admin panel so
they can read incoming messages and reply — all backed by the existing Meta
WhatsApp Cloud API app + webhook.

## Decisions (from brainstorming)

- **Business number:** `8801885596957`. Landing icon opens `wa.me` with an
  empty chat (no prefilled text).
- **Reply:** two-way. Admin sends **text** replies via WhatsApp Cloud API.
- **Incoming types shown:** text, image, video, voice/audio (documents stored
  but shown as a download link).
- **Live updates:** client-side polling (~7s), no WebSocket/SSE.
- **Unread badge:** yes — total unread count shown on the sidebar "WhatsApp" item.
- **Student match:** yes — match a sender's phone to an enrolled `User` and show
  their name/courses in the thread.
- **24-hour window:** enforced. Free-form text replies are only allowed within
  24h of the customer's last inbound message (WhatsApp policy). Outside the
  window, replies are blocked with a clear message. Templates are **out of scope**
  for v1.

## Environment

Add to `.env.example` (and real values in `.env` / `.env.local`):

- `WHATSAPP_ACCESS_TOKEN` — permanent/system-user token for the Graph API.
- `WHATSAPP_PHONE_NUMBER_ID` — the WABA phone number id messages are sent from.
- `NEXT_PUBLIC_WHATSAPP_NUMBER=8801885596957` — used by the landing FAB link.

Existing `WHATSAPP_WEBHOOK_VERIFY_TOKEN` and `WHATSAPP_APP_SECRET` stay as-is.

When `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` are unset, sending and
media download are no-ops that fail gracefully (matching the webhook's existing
"not configured" behavior) — nothing crashes.

## Data model (`models/`)

### `WhatsAppContact`
One document per customer conversation.

- `waId: string` (unique, indexed) — the customer's WhatsApp phone (digits, e.g. `8801…`).
- `profileName?: string` — name from the WhatsApp profile.
- `student?: ObjectId` (ref `User`, nullable) — matched enrolled user, if any.
- `lastMessageAt: Date` — sort key for the conversation list.
- `lastMessageText?: string` — preview snippet.
- `lastInboundAt?: Date` — drives the 24h reply window.
- `unreadCount: number` (default 0).
- `timestamps`.

### `WhatsAppMessage`
One document per message (in or out).

- `contact: ObjectId` (ref `WhatsAppContact`, indexed).
- `waId: string` (indexed) — denormalized customer phone for simple queries.
- `waMessageId: string` (unique, sparse) — WhatsApp message id; idempotency +
  status correlation.
- `direction: 'in' | 'out'`.
- `type: 'text' | 'image' | 'video' | 'audio' | 'document'`.
- `text?: string` — body (text messages, or media caption).
- `mediaPath?: string` — local URL, e.g. `/uploads/whatsapp/<file>`.
- `mediaMime?: string`.
- `status?: 'sent' | 'delivered' | 'read' | 'failed'` — outbound only.
- `error?: string` — failure reason.
- `timestamp: Date` — message time (from WhatsApp for inbound, now for outbound).
- `timestamps`.

## Components

### 1. Webhook upgrade — `app/api/whatsapp/webhook/route.ts`
Currently logs only. New behavior on POST (after signature check, still ACK 200 fast):

- **Inbound `messages[]`:**
  1. `connectDB()`, upsert `WhatsAppContact` by `waId` (set `profileName` from
     `value.contacts[]`, match `student` by phone against `User`).
  2. If the message carries media (image/video/audio/document), resolve the media
     URL via Graph API (`GET /{media-id}`), download with the access token, save
     under `public/uploads/whatsapp/`, store `mediaPath`/`mediaMime`.
  3. Insert `WhatsAppMessage` (`direction:'in'`). Skip if `waMessageId` already
     exists (idempotent — Meta may redeliver).
  4. Bump contact `unreadCount`, `lastMessageAt`, `lastMessageText`, `lastInboundAt`.
- **`statuses[]`:** update the matching outbound `WhatsAppMessage` by
  `waMessageId` → `status` (sent/delivered/read/failed), capture `error`.
- Keep existing signature verification and fast 200 ACK. All new work wrapped so a
  failure still ACKs 200.

### 2. Send helper — `lib/whatsapp.ts`
- `sendText(waId, text)` → `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`
  with `Authorization: Bearer <token>`, body a `text` message. Returns the new
  `waMessageId`.
- `getMediaUrl(mediaId)` / `downloadMedia(...)` helpers used by the webhook.
- `isConfigured()` — false when token/phone-number-id unset (callers 503).
- Reusable `buildWhatsAppLink()` not needed — the FAB builds `wa.me` inline.

### 3. Admin API — `app/api/admin/whatsapp/...` (all `requirePerm`-gated)
- `GET  /api/admin/whatsapp/conversations` (`whatsapp.view`) — contacts sorted by
  `lastMessageAt` desc, with `student` populated (name) and `unreadCount`.
- `GET  /api/admin/whatsapp/conversations/[waId]/messages` (`whatsapp.view`) —
  the thread's messages ascending; side effect: reset that contact's `unreadCount`
  to 0 (mark read).
- `POST /api/admin/whatsapp/conversations/[waId]/messages` (`whatsapp.reply`) —
  body `{ text }`; enforce 24h window (reject 409 if `lastInboundAt` is missing or
  > 24h old), call `sendText`, insert an outbound `WhatsAppMessage` (`status:'sent'`),
  update `lastMessageAt`/`lastMessageText`. Returns the created message.
- `GET  /api/admin/whatsapp/unread-count` (`whatsapp.view`) — `{ count }` total
  unread across contacts, for the sidebar badge.

### 4. Admin page — `app/(admin)/admin/whatsapp/page.tsx`
Server component guards with `requirePage('whatsapp.view')`, renders a client
`WhatsAppInbox` component:

- Two-pane layout: left = conversation list (name/number, snippet, unread dot),
  right = selected thread (bubbles: inbound left, outbound right; media rendered
  inline — `<img>`/`<video>`/`<audio>`; documents as a download link) + a reply box.
- Polls `conversations` (~7s) and the open thread's `messages` (~7s).
- Reply box disabled with an explanatory note when the 24h window is closed
  (client computes from `lastInboundAt`; server re-checks authoritatively).
- Matches the existing dark admin styling (Space Grotesk / Inter, same palette).

### 5. Nav + permissions
- `lib/permissions.ts`: add a `whatsapp` section — actions `whatsapp.view`
  ("View WhatsApp inbox") and `whatsapp.reply` ("Send WhatsApp replies"); add a
  `NAV_ITEMS` entry `{ href: '/admin/whatsapp', label: 'WhatsApp', perm: 'whatsapp.view' }`.
- `components/layout/AdminSidebar.tsx`: map `/admin/whatsapp` → `MessageCircle`
  icon; render an unread-count badge next to the WhatsApp item, fed by polling
  `/api/admin/whatsapp/unread-count` (only when the viewer can see it).

### 6. Landing floating icon
- New client component (e.g. `components/whatsapp/WhatsAppFab.tsx`): fixed
  bottom-right, WhatsApp brand glyph as inline SVG (lucide ships no brand icons),
  links to `https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}` in a new tab
  (`rel="noopener"`). Rendered on the `ai-for-developers` page only.

## Media storage note

Media is downloaded to `public/uploads/whatsapp/` and served at
`/uploads/whatsapp/...`, consistent with the existing `/api/upload` approach. This
persists on the self-hosted (pm2) deployment but would need object storage on a
serverless host — same caveat already documented for uploads.

## Out of scope (v1)

- Message templates / sending outside the 24h window.
- Admin sending media (image/file) to customers — text replies only.
- Real-time push (WebSocket/SSE).
- Assigning conversations to specific admins / internal notes.
