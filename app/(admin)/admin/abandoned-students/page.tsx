import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import StudentsTable from '@/components/admin/StudentsTable';

export default async function AbandonedStudentsPage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/dashboard');

  await connectDB();
  type LeanUser = {
    _id: unknown;
    name: string;
    phone: string;
    avatar?: string;
    createdAt: Date;
  };

  // Students who signed up but never purchased any course.
  const raw = await User.find({ role: 'student', 'purchasedCourses.0': { $exists: false } })
    .sort({ createdAt: -1 })
    .lean<LeanUser[]>();

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
    />
  );
}
