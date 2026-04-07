import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import CoursesTable from '@/components/admin/CoursesTable';

export default async function AdminCoursesPage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/dashboard');

  await connectDB();
  const raw = await Course.find().sort({ createdAt: -1 }).lean();

  const courses = raw.map((c) => ({
    _id: String(c._id),
    title: c.title,
    thumbnail: c.thumbnail,
    price: c.price,
    level: c.level,
    isPublished: c.isPublished,
    slug: c.slug,
  }));

  return <CoursesTable initialCourses={courses} />;
}
