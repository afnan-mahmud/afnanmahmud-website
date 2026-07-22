import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import { StudentNote } from '@/models/StudentNote';
import AbandonedStudentsTable, { type AbandonedRow } from '@/components/admin/AbandonedStudentsTable';
import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';

const PAGE_SIZE = 20;

export default async function AbandonedStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const access = await requirePage('students.view');

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  await connectDB();
  type LeanUser = {
    _id: unknown;
    name: string;
    phone: string;
    avatar?: string;
    createdAt: Date;
  };

  // Students who signed up but never purchased any course.
  const filter = { role: 'student', 'purchasedCourses.0': { $exists: false } };
  const [total, raw] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<LeanUser[]>(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Per-row counts for just this page's students — how many times they hit
  // checkout, and how many call notes we've logged against them.
  const ids = raw.map((u) => u._id);
  const [attemptAgg, noteAgg] = await Promise.all([
    Order.aggregate<{ _id: unknown; count: number }>([
      { $match: { student: { $in: ids } } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]),
    StudentNote.aggregate<{ _id: unknown; count: number }>([
      { $match: { student: { $in: ids } } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
    ]),
  ]);
  const attempts = new Map(attemptAgg.map((a) => [String(a._id), a.count]));
  const notes = new Map(noteAgg.map((n) => [String(n._id), n.count]));

  const students: AbandonedRow[] = raw.map((u) => ({
    _id: String(u._id),
    name: u.name,
    phone: u.phone,
    avatar: u.avatar,
    attempts: attempts.get(String(u._id)) ?? 0,
    notes: notes.get(String(u._id)) ?? 0,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <AbandonedStudentsTable
      students={students}
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={PAGE_SIZE}
      basePath="/admin/abandoned-students"
      canNote={can(access, 'students.notes')}
      canWhatsApp={can(access, 'whatsapp.reply')}
    />
  );
}
