import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Course, type ICourse } from '@/models/Course';
import StudentsTable from '@/components/admin/StudentsTable';

export default async function AdminStudentsPage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/dashboard');

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
  const [raw, coursesRaw] = await Promise.all([
    User.find({ role: 'student', 'purchasedCourses.0': { $exists: true } })
      .populate<{ purchasedCourses: ICourse[] }>('purchasedCourses', 'title slug')
      .sort({ createdAt: -1 })
      .lean<LeanUser[]>(),
    Course.find({}, 'title price').sort({ title: 1 }).lean<LeanCourse[]>(),
  ]);

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

  return <StudentsTable students={students} title="Students" emptyMessage="No purchased students yet" addStudentCourses={courseOptions} />;
}
