import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course, type ICourse } from '@/models/Course';
import { Order } from '@/models/Order';
import StudentsTable from '@/components/admin/StudentsTable';
import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';

const PAGE_SIZE = 20;

// Escape user input so it can be safely used inside a MongoDB regex.
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const access = await requirePage('students.view');

  const { page: pageParam, q: qParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const q = (qParam ?? '').trim();

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
  const filter: Record<string, unknown> = { role: 'student', 'purchasedCourses.0': { $exists: true } };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { phone: rx }];
  }
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

  // Per-course paid amount + purchase date, for the refund modal. One query for
  // all students on this page, keyed by student:course → latest success order.
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
    enrolledCourses: (u.purchasedCourses as ICourse[]).map((c) => {
      const ord = orderMap.get(orderKey(u._id, c._id));
      const purchaseDate = ord?.createdAt ?? u.createdAt ?? new Date();
      return {
        courseId: String(c._id),
        title: c.title,
        slug: c.slug,
        amount: ord?.amount ?? 0,
        purchaseDate: new Date(purchaseDate).toISOString(),
      };
    }),
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <StudentsTable
      students={students}
      title="Students"
      emptyMessage="No purchased students yet"
      addStudentCourses={can(access, 'students.add') ? courseOptions : undefined}
      canRefund={can(access, 'students.refund')}
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={PAGE_SIZE}
      basePath="/admin/students"
      searchQuery={q}
    />
  );
}
