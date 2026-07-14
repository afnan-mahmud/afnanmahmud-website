# Admin Student Refund + Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins request/confirm/reject per-course refunds (revoking or restoring access) and view per-course student details, with refund status shown to students and reflected in the accounts ledger.

**Architecture:** A new `Refund` model tracks a `requested → confirmed/rejected` lifecycle. Requesting removes the course from `User.purchasedCourses` immediately; confirm makes it permanent (and marks the Order `refunded`), reject restores access. Admin UI reuses existing table/modal/pagination patterns; APIs are App Router route handlers gated by new permissions.

**Tech Stack:** Next.js 16 App Router, React 19, MongoDB/Mongoose, NextAuth v5, inline-styled client components (Space Grotesk / Inter fonts), lucide-react icons.

## Global Constraints

- No test framework — verify every task with `npm run lint` (must exit 0; the CI fails on any lint **error**), and drive the flow in the browser where a UI/route is involved. Do NOT introduce pytest/jest.
- Next.js 16: `params` and `searchParams` are Promises — `await` them in server components and route handlers.
- Call `connectDB()` before any Mongoose query in a request.
- Admin API routes gate with `requirePerm('<key>')` (returns bool → 403); admin pages gate with `requirePage('<key>')`. Import from `@/lib/permissions.server`; `can(access, key)` from `@/lib/permissions`.
- UI copy is bilingual Bangla/English; phones are BD format `01XXXXXXXXX`. Match the dark inline-style aesthetic of existing admin components (`StudentsTable.tsx`, `OrdersTable.tsx`).
- Money is BDT, rendered `৳{n.toLocaleString()}`.
- Commit after each task with a `feat(...)`/`fix(...)` message ending:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Work on branch `feat/admin-student-refund` (already created).

---

### Task 1: Refund model + Order `refunded` status

**Files:**
- Create: `models/Refund.ts`
- Modify: `models/Order.ts` (status enum)

**Interfaces:**
- Produces: `Refund` model with `IRefund` interface; `RefundStatus = 'requested' | 'confirmed' | 'rejected'`. Order `status` now includes `'refunded'`.

- [ ] **Step 1: Create `models/Refund.ts`**

```ts
import { Schema, model, models, Document, Types } from 'mongoose';

export type RefundStatus = 'requested' | 'confirmed' | 'rejected';

export interface IRefund extends Document {
  student: Types.ObjectId;
  course: Types.ObjectId;
  order?: Types.ObjectId;
  amount: number;
  studentName: string;
  phone: string;
  courseTitle: string;
  /** Join/purchase date — drives the 7-day warning. */
  purchaseDate: Date;
  status: RefundStatus;
  requestedBy: Types.ObjectId;
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
}

const RefundSchema = new Schema<IRefund>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: Number, required: true, default: 0 },
    studentName: { type: String, default: '' },
    phone: { type: String, default: '' },
    courseTitle: { type: String, default: '' },
    purchaseDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'rejected'],
      default: 'requested',
      index: true,
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Refund = models.Refund ?? model<IRefund>('Refund', RefundSchema);
```

- [ ] **Step 2: Add `'refunded'` to the Order status enum**

In `models/Order.ts`, change the interface line:

```ts
  status: 'pending' | 'success' | 'failed' | 'refunded';
```

and the schema enum:

```ts
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
```

- [ ] **Step 3: Verify**

Run: `npm run lint`
Expected: exit 0, no new errors.

- [ ] **Step 4: Commit**

```bash
git add models/Refund.ts models/Order.ts
git commit -m "feat(refund): add Refund model and Order refunded status"
```

---

### Task 2: Permissions + sidebar nav

**Files:**
- Modify: `lib/permissions.ts` (action keys + nav item)
- Modify: `components/layout/AdminSidebar.tsx` (icon map)

**Interfaces:**
- Produces: permission keys `students.refund`, `refunds.manage`; nav item `/admin/refunds`.

- [ ] **Step 1: Add permission action keys**

In `lib/permissions.ts`, in the `PERMISSIONS` array's students group `actions` (after `students.add`):

```ts
      { key: 'students.refund', label: 'Request course refund' },
```

Add a new group object after the `accounts` group (the group shape is `{ id, label, path, actions }` — `ALL_PERMISSIONS` auto-derives from `actions`, no other edit needed):

```ts
  {
    id: 'refunds',
    label: 'Refunds',
    path: '/admin/refunds',
    actions: [{ key: 'refunds.manage', label: 'View & confirm/reject refunds' }],
  },
```

- [ ] **Step 2: Add the nav item**

In `NAV_ITEMS`, after the orders line:

```ts
  { href: '/admin/refunds', label: 'Refunds', perm: 'refunds.manage' },
```

- [ ] **Step 3: Add the sidebar icon**

In `components/layout/AdminSidebar.tsx`, add `RotateCcw` to the lucide import (line ~7), then in the `ICONS` map:

```ts
  '/admin/refunds': RotateCcw,
```

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: exit 0. (Confirm the group object shape matches the existing groups — if the type is stricter, mirror the exact fields the other groups use.)

- [ ] **Step 5: Commit**

```bash
git add lib/permissions.ts components/layout/AdminSidebar.tsx
git commit -m "feat(refund): add refund permissions and sidebar nav"
```

---

### Task 3: Request-refund API

**Files:**
- Create: `app/api/admin/refunds/route.ts`

**Interfaces:**
- Consumes: `Refund` (Task 1), `requirePerm` (`@/lib/permissions.server`), `auth` (`@/lib/auth`).
- Produces: `POST /api/admin/refunds` body `{ studentId, courseId }` → `{ success: true }` (201) or error.

- [ ] **Step 1: Create the route handler**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { Refund } from '@/models/Refund';
import { auth } from '@/lib/auth';
import { requirePerm } from '@/lib/permissions.server';

export async function POST(req: NextRequest) {
  if (!(await requirePerm('students.refund'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = (await req.json()) as { studentId?: string; courseId?: string };
  const { studentId, courseId } = body;
  if (!studentId || !courseId) {
    return NextResponse.json({ error: 'studentId ar courseId din' }, { status: 400 });
  }

  await connectDB();

  const user = await User.findById(studentId);
  if (!user) return NextResponse.json({ error: 'Student paoa jayni' }, { status: 404 });

  const owns = user.purchasedCourses.some((id: unknown) => String(id) === String(courseId));
  if (!owns) {
    return NextResponse.json({ error: 'Student ei course-e enrolled na' }, { status: 409 });
  }

  const existing = await Refund.findOne({ student: studentId, course: courseId, status: 'requested' });
  if (existing) {
    return NextResponse.json({ error: 'Ei course-er refund already requested' }, { status: 409 });
  }

  const course = await Course.findById(courseId).lean<{ title: string }>();

  // Source amount + purchase date from the paid order (may not exist for free/0 enrollments).
  const order = await Order.findOne({ student: studentId, course: courseId, status: 'success' })
    .sort({ createdAt: -1 });

  await Refund.create({
    student: user._id,
    course: courseId,
    order: order?._id,
    amount: order?.amount ?? 0,
    studentName: user.name,
    phone: user.phone,
    courseTitle: course?.title ?? '',
    purchaseDate: order?.createdAt ?? user.createdAt,
    status: 'requested',
    requestedBy: adminId,
  });

  // Revoke access immediately (pending).
  user.purchasedCourses = user.purchasedCourses.filter(
    (id: unknown) => String(id) !== String(courseId)
  );
  await user.save();

  await Course.updateOne({ _id: courseId, enrolledCount: { $gt: 0 } }, { $inc: { enrolledCount: -1 } });

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/refunds/route.ts
git commit -m "feat(refund): request-refund API revokes course access"
```

---

### Task 4: Refund button + RefundModal in StudentsTable

**Files:**
- Create: `components/admin/RefundModal.tsx`
- Modify: `components/admin/StudentsTable.tsx` (add buttons + props)
- Modify: `app/(admin)/admin/students/page.tsx` (pass `canRefund` + enriched course list)

**Interfaces:**
- Consumes: `POST /api/admin/refunds` (Task 3).
- Produces: `StudentsTable` gains props `canRefund?: boolean` and `onRefund` handling via modal. Each student row needs its refundable courses with `{ courseId, title, amount, purchaseDate }` — extend the `StudentRow.enrolledCourses` item shape to include `courseId`, `amount`, `purchaseDate` (ISO string).

- [ ] **Step 1: Enrich the student data in the page**

In `app/(admin)/admin/students/page.tsx`, the enrolled courses currently expose `{ title, slug }`. Add `courseId` (and, for refund, per-course paid amount + purchase date). Fetch success orders for the page's students in one query and map them:

```ts
import { Order } from '@/models/Order';
// ...after loading `raw` (the paged users)...
const studentIds = raw.map((u) => u._id);
const orders = await Order.find({ student: { $in: studentIds }, status: 'success' })
  .select('student course amount createdAt')
  .lean<{ student: unknown; course: unknown; amount: number; createdAt: Date }[]>();

const orderKey = (s: unknown, c: unknown) => `${String(s)}:${String(c)}`;
const orderMap = new Map<string, { amount: number; createdAt: Date }>();
for (const o of orders) {
  const k = orderKey(o.student, o.course);
  const prev = orderMap.get(k);
  if (!prev || new Date(o.createdAt) > new Date(prev.createdAt)) {
    orderMap.set(k, { amount: o.amount, createdAt: o.createdAt });
  }
}
```

Then in the `students` map, build `enrolledCourses` with the extra fields:

```ts
enrolledCourses: (u.purchasedCourses as ICourse[]).map((c) => {
  const ord = orderMap.get(orderKey(u._id, c._id));
  return {
    courseId: String(c._id),
    title: c.title,
    slug: c.slug,
    amount: ord?.amount ?? 0,
    purchaseDate: (ord?.createdAt ?? u.createdAt
      ? new Date(ord?.createdAt ?? u.createdAt)
      : new Date()
    ).toISOString(),
  };
}),
```

Pass to the table:

```tsx
canRefund={can(access, 'students.refund')}
```

(`can` is already imported.)

- [ ] **Step 2: Create `components/admin/RefundModal.tsx`**

A client modal that receives the student `{ _id, name, phone }` and `courses: { courseId, title, amount, purchaseDate }[]`, lets the admin pick one course (radio list showing title, `৳amount`, purchase date, and a `⚠️ 7 din periye geche` warning when `Date.now() - purchaseDate > 7*24*3600*1000`), and POSTs to `/api/admin/refunds`. On success it calls `router.refresh()` and closes. Follow the styling and structure of `components/admin/AddStudentModal.tsx` (fixed overlay, dark card, Space Grotesk headings). Key logic:

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface RefundCourse { courseId: string; title: string; amount: number; purchaseDate: string; }

export default function RefundModal({
  student, courses, onClose,
}: {
  student: { _id: string; name: string; phone: string };
  courses: RefundCourse[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const isOld = (iso: string) => Date.now() - new Date(iso).getTime() > 7 * 24 * 3600 * 1000;

  const submit = async () => {
    if (!selected) { setError('Ekta course select korun'); return; }
    setBusy(true); setError('');
    const res = await fetch('/api/admin/refunds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: student._id, courseId: selected }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? 'Refund request byartho'); return; }
    router.refresh();
    onClose();
  };
  // ...render overlay + radio list of `courses` (title, ৳amount, purchaseDate, warning if isOld) + Cancel/Submit...
}
```

Render the full overlay/card markup mirroring `AddStudentModal.tsx`.

- [ ] **Step 3: Wire buttons into `StudentsTable.tsx`**

- Extend `EnrolledCourse` interface: add `courseId: string; amount: number; purchaseDate: string;`.
- Add prop `canRefund?: boolean;`.
- Add state `const [refundFor, setRefundFor] = useState<StudentRow | null>(null);`.
- In each row (rightmost, only when `showEnrolled`), add an actions cell with a **Refund** button (renders only when `canRefund && s.enrolledCount > 0`) that calls `setRefundFor(s)` (stop row-toggle propagation with `e.stopPropagation()`). The Details button is added in Task 7 — leave room in this cell.
- After the table, render `{refundFor && <RefundModal student={refundFor} courses={refundFor.enrolledCourses.map(c => ({ courseId: c.courseId, title: c.title, amount: c.amount, purchaseDate: c.purchaseDate }))} onClose={() => setRefundFor(null)} />}`.
- Add the `''` header for the new actions column to `headers` (and bump `colCount` via the existing derivation).

- [ ] **Step 4: Verify**

Run: `npm run lint`
Then drive it: `npm run dev`, log in as an admin with `students.refund`, open `/admin/students`, click Refund on a student, pick a course, submit. Confirm the course disappears from that student's enrolled list after refresh, and a `Refund` doc exists (`status: 'requested'`).

- [ ] **Step 5: Commit**

```bash
git add components/admin/RefundModal.tsx components/admin/StudentsTable.tsx "app/(admin)/admin/students/page.tsx"
git commit -m "feat(refund): refund button + course-picker modal on students page"
```

---

### Task 5: Refunds queue page + resolve API

**Files:**
- Create: `app/api/admin/refunds/[id]/resolve/route.ts`
- Create: `app/(admin)/admin/refunds/page.tsx`
- Create: `components/admin/RefundsTable.tsx`

**Interfaces:**
- Consumes: `Refund` (Task 1), `requirePerm`/`requirePage`, `Pagination` (`@/components/admin/Pagination`).
- Produces: `POST /api/admin/refunds/[id]/resolve` body `{ action: 'confirm' | 'reject' }`.

- [ ] **Step 1: Create the resolve API**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Order } from '@/models/Order';
import { Refund } from '@/models/Refund';
import { auth } from '@/lib/auth';
import { requirePerm } from '@/lib/permissions.server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('refunds.manage'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const session = await auth();
  const adminId = session?.user?.id;
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { action } = (await req.json()) as { action?: 'confirm' | 'reject' };
  if (action !== 'confirm' && action !== 'reject') {
    return NextResponse.json({ error: 'action confirm ba reject hote hobe' }, { status: 400 });
  }

  await connectDB();

  const refund = await Refund.findById(id);
  if (!refund) return NextResponse.json({ error: 'Refund paoa jayni' }, { status: 404 });
  if (refund.status !== 'requested') {
    return NextResponse.json({ error: 'Ei refund already resolved' }, { status: 409 });
  }

  if (action === 'confirm') {
    refund.status = 'confirmed';
    if (refund.order) {
      await Order.updateOne({ _id: refund.order }, { $set: { status: 'refunded' } });
    }
  } else {
    refund.status = 'rejected';
    // Restore access.
    await User.updateOne(
      { _id: refund.student, purchasedCourses: { $ne: refund.course } },
      { $push: { purchasedCourses: refund.course } }
    );
    await Course.updateOne({ _id: refund.course }, { $inc: { enrolledCount: 1 } });
  }
  refund.resolvedBy = adminId;
  refund.resolvedAt = new Date();
  await refund.save();

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create `components/admin/RefundsTable.tsx`**

Client component mirroring `OrdersTable.tsx`: a status filter (`all | requested | confirmed | rejected` via `?status=` Links), a table with columns Name, Phone, Course, Amount (`৳`), Purchase date (`formatDhakaDate`), Status badge, Actions. On `requested` rows show **Confirm** / **Reject** buttons calling `POST /api/admin/refunds/{id}/resolve` then `router.refresh()`. Show a `⚠️ 7 days+` badge next to the purchase date when older than 7 days. Render `<Pagination ... extraParams={{ status: status === 'all' ? undefined : status }} />`. Props:

```ts
interface RefundRow {
  _id: string; studentName: string; phone: string; courseTitle: string;
  amount: number; purchaseDate: string; status: 'requested' | 'confirmed' | 'rejected';
}
// props: { refunds: RefundRow[]; status: Filter; canManage: boolean; page; totalPages; total; pageSize; }
```

Status badge colors: requested → amber (`#fbbf24`), confirmed → red (`#f87171`, money left), rejected → zinc/grey. Reuse the `STATUS_STYLE` pattern from `OrdersTable.tsx`.

- [ ] **Step 3: Create `app/(admin)/admin/refunds/page.tsx`**

Server page mirroring `app/(admin)/admin/orders/page.tsx`: `requirePage('refunds.manage')`, read `{ page, status }` from `await searchParams`, `connectDB()`, build filter (`status === 'all' ? {} : { status }`), `Refund.countDocuments` + `Refund.find(filter).sort({ createdAt: -1 }).skip(...).limit(PAGE_SIZE).lean()`, map to `RefundRow[]` (stringify `_id`, ISO the dates), and render `<RefundsTable ... canManage={can(access, 'refunds.manage')} basePath="/admin/refunds" />`. `PAGE_SIZE = 20`.

- [ ] **Step 4: Verify**

Run: `npm run lint`, then `npm run dev`: visit `/admin/refunds`, see the request from Task 4, click **Reject** → confirm the course returns to the student's enrolled list (`/admin/students`); create another request, click **Confirm** → confirm the linked Order shows `refunded` and access stays gone.

- [ ] **Step 5: Commit**

```bash
git add "app/api/admin/refunds/[id]/resolve/route.ts" "app/(admin)/admin/refunds/page.tsx" components/admin/RefundsTable.tsx
git commit -m "feat(refund): refunds queue with confirm/reject"
```

---

### Task 6: Accounts ledger reflects refunds

**Files:**
- Modify: `app/(admin)/admin/accounts/page.tsx`

**Interfaces:**
- Consumes: `Refund` model (`status: 'confirmed'`).

The accounts page (as of writing) queries `Order.find({ status: 'success' })` into `successOrders`, computes `totalOrders`/`totalExpense`/`mainAccount = totalOrders - totalExpense`, then builds a `type Entry = { id; date; particulars; credit; debit }` array from `successOrders` (credit) + `expenses` (debit), sorts oldest→newest, and reduces into a running-balance `ledger`.

- [ ] **Step 1: Include refunded orders in credit**

Change the credit query so the original sale of a refunded order still counts:

```ts
    Order.find({ status: { $in: ['success', 'refunded'] } })
```

(Keeps the `.populate(...).lean<LeanOrder[]>()` chain and the `successOrders` variable name unchanged.)

- [ ] **Step 2: Load confirmed refunds, add debit entries, adjust totals**

Add the import at the top:

```ts
import { Refund } from '@/models/Refund';
```

Add a query for confirmed refunds (put it in the same `Promise.all` as the orders/expenses fetch, or as its own `await` right after):

```ts
  const refunds = await Refund.find({ status: 'confirmed' })
    .select('courseTitle phone amount resolvedAt createdAt')
    .lean<{ _id: unknown; courseTitle: string; phone: string; amount: number; resolvedAt?: Date; createdAt: Date }[]>();
```

Fold refunds into the totals (they reduce net income):

```ts
  const totalRefunds = refunds.reduce((s, r) => s + r.amount, 0);
  const mainAccount = totalOrders - totalExpense - totalRefunds;
```

And add refund debit entries into the `entries` array literal, as a third spread alongside `successOrders` and `expenses` (before the `.sort(...)`):

```ts
    ...refunds.map((r) => ({
      id: `refund-${String(r._id)}`,
      date: new Date(r.resolvedAt ?? r.createdAt),
      particulars: `Refund — ${r.courseTitle || 'Course'} (${r.phone})`,
      credit: 0,
      debit: r.amount,
    })),
```

The existing oldest→newest sort and running-balance reduce then naturally account for the refund debits.

- [ ] **Step 2: Verify**

Run: `npm run lint`, then load `/admin/accounts`: the confirmed refund from Task 5 appears as a debit line and the running balance drops by the refund amount; the original sale still shows as credit.

- [ ] **Step 3: Commit**

```bash
git add "app/(admin)/admin/accounts/page.tsx"
git commit -m "feat(refund): reflect confirmed refunds as ledger debits"
```

---

### Task 7: Student details view

**Files:**
- Create: `app/api/admin/students/[id]/route.ts`
- Create: `components/admin/StudentDetailsModal.tsx`
- Modify: `components/admin/StudentsTable.tsx` (Details button)

**Interfaces:**
- Consumes: `requirePerm('students.view')`, `User`, `Course`, `Order`, `Refund`.
- Produces: `GET /api/admin/students/[id]` → `{ student: { name, phone, createdAt }, courses: CourseDetail[] }` where `CourseDetail = { title, slug, joinDate, completed, total, amountPaid, transactionId, paymentGateway, refundStatus? }`.

- [ ] **Step 1: Create the details API**

```ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course, type ICourse } from '@/models/Course';
import { Order } from '@/models/Order';
import { Refund } from '@/models/Refund';
import { requirePerm } from '@/lib/permissions.server';
import type { IProgress } from '@/models/User';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('students.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();

  const user = await User.findById(id)
    .populate<{ purchasedCourses: ICourse[] }>('purchasedCourses')
    .lean<{ name: string; phone: string; createdAt: Date; purchasedCourses: ICourse[]; progress: IProgress[] }>();
  if (!user) return NextResponse.json({ error: 'Student paoa jayni' }, { status: 404 });

  const orders = await Order.find({ student: id })
    .select('course amount transactionId paymentGateway status createdAt')
    .lean<{ course: unknown; amount: number; transactionId?: string; paymentGateway?: string; status: string; createdAt: Date }[]>();
  const refunds = await Refund.find({ student: id })
    .select('course status')
    .lean<{ course: unknown; status: string }[]>();

  const totalLessons = (c: ICourse) => c.curriculum.reduce((s, sec) => s + sec.lessons.length, 0);
  const completedFor = (cid: unknown) =>
    user.progress.find((p) => String(p.courseId) === String(cid))?.completedLessons?.length ?? 0;

  const courses = (user.purchasedCourses ?? []).map((c) => {
    const ord = orders
      .filter((o) => String(o.course) === String(c._id) && o.status === 'success')
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    const rf = refunds.find((r) => String(r.course) === String(c._id));
    return {
      title: c.title,
      slug: c.slug,
      joinDate: (ord?.createdAt ?? user.createdAt).toString(),
      completed: completedFor(c._id),
      total: totalLessons(c),
      amountPaid: ord?.amount ?? 0,
      transactionId: ord?.transactionId ?? null,
      paymentGateway: ord?.paymentGateway ?? null,
      refundStatus: rf?.status ?? null,
    };
  });

  return NextResponse.json({
    student: { name: user.name, phone: user.phone, createdAt: user.createdAt },
    courses,
  });
}
```

- [ ] **Step 2: Create `components/admin/StudentDetailsModal.tsx`**

Client modal opened with a `studentId`. On mount it `fetch`es `/api/admin/students/{studentId}`, shows a loader, then a header (name / phone / `Joined {formatDhakaDate(createdAt)}`) and one card per course: join date, `{completed} / {total} lessons ({pct}%)`, `৳{amountPaid}` + transaction id + gateway, and a refund badge when `refundStatus` is set. Mirror `RefundModal` overlay styling. Skeleton:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { formatDhakaDate } from '@/lib/date';

interface CourseDetail {
  title: string; slug: string; joinDate: string; completed: number; total: number;
  amountPaid: number; transactionId: string | null; paymentGateway: string | null;
  refundStatus: 'requested' | 'confirmed' | 'rejected' | null;
}

export default function StudentDetailsModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [data, setData] = useState<{ student: { name: string; phone: string; createdAt: string }; courses: CourseDetail[] } | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch(`/api/admin/students/${studentId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then(setData)
      .catch(() => setError('Details load hoyni'));
  }, [studentId]);
  // ...render overlay: loader while !data && !error; error state; else header + course cards...
}
```

- [ ] **Step 3: Add the Details button in `StudentsTable.tsx`**

In the actions cell added in Task 4, add a **Details** button (always shown for purchased rows, i.e. when `showEnrolled`) that calls `setDetailsFor(s._id)` with `e.stopPropagation()`. Add state `const [detailsFor, setDetailsFor] = useState<string | null>(null);` and render `{detailsFor && <StudentDetailsModal studentId={detailsFor} onClose={() => setDetailsFor(null)} />}` after the table.

- [ ] **Step 4: Verify**

Run: `npm run lint`, then `npm run dev`: on `/admin/students` click **Details** for a student → modal shows per-course join date, lessons completed, payment info, and refund status where applicable.

- [ ] **Step 5: Commit**

```bash
git add "app/api/admin/students/[id]/route.ts" components/admin/StudentDetailsModal.tsx components/admin/StudentsTable.tsx
git commit -m "feat(students): per-course details modal"
```

---

### Task 8: Student portal refund status

**Files:**
- Modify: `app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `Refund` model (student's `requested` + `confirmed`).

- [ ] **Step 1: Query the student's refunds and render a section**

In `app/(dashboard)/dashboard/page.tsx`, after loading `user`, add:

```ts
import { Refund } from '@/models/Refund';
// ...
const refunds = await Refund.find({
  student: session.user.id,
  status: { $in: ['requested', 'confirmed'] },
})
  .select('courseTitle status')
  .sort({ createdAt: -1 })
  .lean<{ courseTitle: string; status: 'requested' | 'confirmed' }[]>();
```

Render a "Refunds" section (only when `refunds.length > 0`) above or below My Courses, one row per refund: `courseTitle` + a badge — `requested` → "Refund processing" (amber), `confirmed` → "Refunded" (green/grey). Match the dashboard card styling (`rgba(255,255,255,0.04)` cards, Space Grotesk / Inter).

- [ ] **Step 2: Verify**

Run: `npm run lint`, then log in as a student who has a `requested`/`confirmed` refund → dashboard shows the Refunds section with the correct status; the refunded course is absent from My Courses.

- [ ] **Step 3: Commit**

```bash
git add "app/(dashboard)/dashboard/page.tsx"
git commit -m "feat(refund): show refund status in student portal"
```

---

## Final verification

- [ ] `npm run lint` → exit 0.
- [ ] `npm run build` → succeeds.
- [ ] End-to-end walk: request refund (access gone) → reject (access back) → request again → confirm (Order `refunded`, ledger debit, student portal shows "Refunded").
