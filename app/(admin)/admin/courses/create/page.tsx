import CourseForm from '@/components/admin/CourseForm';
import { requirePage } from '@/lib/permissions.server';

export default async function CreateCoursePage() {
  await requirePage('courses.create');
  return <CourseForm mode="create" />;
}
