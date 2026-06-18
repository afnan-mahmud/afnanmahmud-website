import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course, type ICourse } from '@/models/Course';
import StudentsTable from '@/components/admin/StudentsTable';
import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';

const PAGE_SIZE = 20;

export default async function AdminStudentsPage({
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
    purchasedCourses: ICourse[];
    createdAt: Date;
  };

  type LeanCourse = { _id: unknown; title: string; price: number };

  // Only students who have purchased at least one course.
  const filter = { role: 'student', 'purchasedCourses.0': { $exists: true } };
  const [total, raw, coursesRaw] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .populate<{ purchasedCourses: ICourse[] }>('purchasedCourses', 'title slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean<LeanUser[]>(),
    Course.find({}, 'title price').sort({ title: 1 }).lean<LeanCourse[]>(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const courseOptions = coursesRaw.map((c) => ({
    _id: String(c._id),
    title: c.title,
    price: c.price,
  }));

  const students = raw.map((u) => ({
    _id: String(u._id),
    name: u.name,
    phone: u.phone,
    avatar: u.avatar,
    enrolledCount: (u.purchasedCourses as ICourse[]).length,
    enrolledCourses: (u.purchasedCourses as ICourse[]).map((c) => ({ title: c.title, slug: c.slug })),
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <StudentsTable
      students={students}
      title="Students"
      emptyMessage="No purchased students yet"
      addStudentCourses={can(access, 'students.add') ? courseOptions : undefined}
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={PAGE_SIZE}
      basePath="/admin/students"
    />
  );
}
