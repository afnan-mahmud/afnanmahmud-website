import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import StudentsTable from '@/components/admin/StudentsTable';
import { requirePage } from '@/lib/permissions.server';

const PAGE_SIZE = 20;

export default async function AbandonedStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePage('students.view');

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

  const students = raw.map((u) => ({
    _id: String(u._id),
    name: u.name,
    phone: u.phone,
    avatar: u.avatar,
    enrolledCount: 0,
    enrolledCourses: [],
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <StudentsTable
      students={students}
      title="Abandoned Students"
      emptyMessage="No abandoned students"
      showEnrolled={false}
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={PAGE_SIZE}
      basePath="/admin/abandoned-students"
    />
  );
}
