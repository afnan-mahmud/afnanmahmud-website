import CourseForm from '@/components/admin/CourseForm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CreateCoursePage() {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/dashboard');
  return <CourseForm mode="create" />;
}
