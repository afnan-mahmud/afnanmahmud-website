# Admin Student Refund + Details — Design

**Date:** 2026-07-14
**Status:** Approved (pending spec review)

## Problem

The admin students page lists purchased students but offers no way to (a)
refund a student's course purchase or (b) inspect a student's per-course
activity. Admins currently handle refunds entirely outside the system, so
course access is never actually revoked and there is no record of the refund.

## Goals

1. From each student row, an admin can **request a refund** for a specific
   course. Requesting immediately removes that course's access; the student's
   account and phone number are untouched.
2. A new **Refunds** admin menu lists all refund requests. An authorized admin
   can **Confirm** (access permanently gone) or **Reject** (access restored).
3. From each student row, an admin can **view details**: per-course join date,
   lessons completed, payment info, and refund status.
4. The student sees their refund **status** in their portal.
5. Confirmed refunds are reflected in the **accounts ledger**.

EPS provides no refund API, so no payment-gateway call is made — the refund is
processed manually in the EPS panel by staff. This feature records the refund
and controls course access.

## Non-goals

- No automated gateway refund call.
- No partial-lesson / time-based proration. Refund amount = what the student paid.
- No hard block on refunds older than 7 days (warning only).

## Data model

### New: `models/Refund.ts`

| field | type | notes |
|---|---|---|
| `student` | ObjectId → User | required |
| `course` | ObjectId → Course | required |
| `order` | ObjectId → Order | the success order being refunded (optional if none found) |
| `amount` | Number | snapshot of what the student paid (`Order.amount`) |
| `studentName` | String | snapshot for the queue display |
| `phone` | String | snapshot |
| `courseTitle` | String | snapshot |
| `purchaseDate` | Date | join date (`Order.createdAt`); drives the 7-day warning |
| `status` | `'requested' \| 'confirmed' \| 'rejected'` | default `'requested'` |
| `requestedBy` | ObjectId → User | admin who requested |
| `resolvedBy` | ObjectId → User | admin who confirmed/rejected |
| `resolvedAt` | Date | set on resolve |
| `createdAt` | Date | timestamps (createdAt only, matching repo convention) |

Snapshots (`studentName`, `phone`, `courseTitle`, `amount`, `purchaseDate`) make
the refund queue resilient to later edits/deletes of the underlying user/course.

### Changed: `models/Order.ts`

Add `'refunded'` to the `status` enum (`'pending' | 'success' | 'failed' |
'refunded'`). Set on refund **confirm**.

## Permissions (`lib/permissions.ts`)

Add two action keys under the existing "students" group (and a new nav-visible key):

- `students.refund` — request a refund from the student row.
- `refunds.manage` — view the Refunds queue **and** confirm/reject requests.

Add nav item: `{ href: '/admin/refunds', label: 'Refunds', perm: 'refunds.manage' }`,
placed after Orders. Sidebar icon (`components/layout/AdminSidebar.tsx`):
`'/admin/refunds': RotateCcw`.

## Flow 1 — Request refund (student row)

**UI:** `components/admin/StudentsTable.tsx` gains two per-row buttons for
purchased students: **Details** and **Refund**. The Refund button is gated on a
new `canRefund` prop (passed from the page based on `students.refund`).

Because a student can hold multiple courses, Refund opens
`components/admin/RefundModal.tsx`, listing the student's refundable courses.
Each row shows course title, amount paid, purchase date, and a
`⚠️ 7 din periye geche` warning when `now - purchaseDate > 7 days`. Admin picks
one course → submit.

**API:** `POST /api/admin/refunds` — perm `students.refund`.
Body: `{ studentId, courseId }`.
1. `connectDB()`.
2. Find the `success` Order for `(student, course)` → source of `amount` and
   `purchaseDate`. (If none — e.g. free enrollment — `amount = 0`, `purchaseDate
   = user.createdAt`, `order` unset.)
3. Guard: reject if an open (`requested`) Refund already exists for this
   student+course (409).
4. Create Refund with `status: 'requested'` and all snapshots.
5. Remove `course` from `user.purchasedCourses`; decrement `Course.enrolledCount`
   (floor 0). **Access is now gone (pending).**
6. Return `{ success: true }`.

## Flow 2 — Resolve refund (Refunds menu)

**UI:** new page `app/(admin)/admin/refunds/page.tsx` (perm `refunds.manage`)
rendering `components/admin/RefundsTable.tsx`. Server-side pagination + optional
`?status=` filter, matching the Orders table pattern (`Pagination` with
`extraParams`). Columns: student name, phone, course, amount, purchase date,
status badge, and a 7-day warning badge on `requested` rows whose `purchaseDate`
is older than 7 days.

`requested` rows show **Confirm** and **Reject** buttons.

**API:** `POST /api/admin/refunds/[id]/resolve` — perm `refunds.manage`.
Body: `{ action: 'confirm' | 'reject' }`. Only acts on a `requested` refund
(idempotent/no-op otherwise → 409).
- **confirm:** `status = 'confirmed'`, set `resolvedBy`/`resolvedAt`; set the
  linked Order `status = 'refunded'`. Access stays removed.
- **reject:** `status = 'rejected'`, set `resolvedBy`/`resolvedAt`; re-add
  `course` to `user.purchasedCourses` (guard against duplicates) and increment
  `Course.enrolledCount`. Access restored. Progress (`completedLessons`) was
  never touched, so restoration is complete.

## Flow 3 — Accounts ledger (`app/(admin)/admin/accounts/page.tsx`)

- Credit query changes from `status: 'success'` to
  `status: { $in: ['success', 'refunded'] }` so the original sale still counts as
  income (the refunded order otherwise silently drops out of credit).
- Add debit entries for `confirmed` Refunds: particulars
  `Refund — <courseTitle> (<phone>)`, `debit = amount`, dated `resolvedAt`.
- Net effect on that sale = 0 (credit +amount, debit −amount); both lines remain
  visible in the ledger.

## Flow 4 — Details view (student row)

**UI:** `components/admin/StudentDetailsModal.tsx` (client), opened by the
Details button, fetches `GET /api/admin/students/[id]` (perm `students.view`).

**API response** (per purchased course, plus courses currently under refund):
- `title`, `slug`
- `joinDate` — the `success` Order `createdAt` for that course (fallback
  `user.createdAt`)
- `completed` / `total` lessons (`total` = sum of `curriculum[].lessons.length`;
  `completed` = `user.progress` entry's `completedLessons.length`)
- `amountPaid`, `transactionId`, `paymentGateway` (from the Order)
- `refundStatus` — from the Refund collection for this student+course, if any

Modal layout: student header (name / phone / account-created date), then a card
per course with join date, `X / Y lessons (pct%)`, payment info, and a refund
badge when present.

## Flow 5 — Student portal refund status (`app/(dashboard)/dashboard/page.tsx`)

Query Refunds for the logged-in student with `status ∈ {requested, confirmed}`.
Render a small "Refunds" section (above or below My Courses) with one row per
refund: `<courseTitle>` + a badge — `requested` → "Refund processing",
`confirmed` → "Refunded". Rejected refunds need no surface (the course reappears
normally in My Courses). Because a refunded/requested course is removed from
`purchasedCourses`, this section is the student's only view of that status.

## Files touched

**New**
- `models/Refund.ts`
- `app/api/admin/refunds/route.ts` (POST request)
- `app/api/admin/refunds/[id]/resolve/route.ts` (POST confirm/reject)
- `app/api/admin/students/[id]/route.ts` (GET details)
- `app/(admin)/admin/refunds/page.tsx`
- `components/admin/RefundsTable.tsx`
- `components/admin/RefundModal.tsx`
- `components/admin/StudentDetailsModal.tsx`

**Changed**
- `models/Order.ts` (enum + `'refunded'`)
- `lib/permissions.ts` (perm keys + nav item)
- `components/layout/AdminSidebar.tsx` (icon)
- `components/admin/StudentsTable.tsx` (Details + Refund buttons, new props)
- `app/(admin)/admin/students/page.tsx` (pass `canRefund`)
- `app/(admin)/admin/accounts/page.tsx` (ledger credit query + refund debits)
- `app/(dashboard)/dashboard/page.tsx` (refund status section)

## Edge cases

- **No success order for a course** (free/manual-0 enrollment): refund amount 0,
  no Order to mark refunded, no ledger impact; access still revoked/restored.
- **Duplicate request:** a second `requested` refund for the same student+course
  is rejected (409).
- **Resolve on already-resolved refund:** no-op / 409.
- **Reject re-add:** guard so the course isn't duplicated in `purchasedCourses`.
- **enrolledCount** never goes below 0.
- Refund/Details buttons only render for purchased students (not the abandoned-
  students reuse of `StudentsTable`).
