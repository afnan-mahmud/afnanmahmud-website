import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import CoursesTable from '@/components/admin/CoursesTable';
import { requirePage } from '@/lib/permissions.server';
import { can } from '@/lib/permissions';

export default async function AdminCoursesPage() {
  const access = await requirePage('courses.view');

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

  return (
    <CoursesTable
      initialCourses={courses}
      canCreate={can(access, 'courses.create')}
      canEdit={can(access, 'courses.edit')}
      canDelete={can(access, 'courses.delete')}
    />
  );
}
