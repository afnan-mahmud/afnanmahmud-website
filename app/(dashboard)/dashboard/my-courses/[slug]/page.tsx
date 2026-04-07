import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import VideoPlayer from '@/components/dashboard/VideoPlayer';
import type { ICourse } from '@/models/Course';
import type { IProgress } from '@/models/User';

interface PopulatedUser {
  purchasedCourses: { _id: unknown; toString(): string }[];
  progress: IProgress[];
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect('/auth/otp');

  await connectDB();

  const course = await Course.findOne({ slug, isPublished: true }).lean<ICourse>();
  if (!course) notFound();

  const user = await User.findById(session.user.id)
    .select('purchasedCourses progress')
    .lean<PopulatedUser>();

  const courseId = (course._id as { toString(): string }).toString();

  // Guard: must own the course
  const owns = user?.purchasedCourses?.some((id) => id.toString() === courseId);
  if (!owns) redirect(`/courses/${slug}`);

  const progressEntry = user?.progress?.find(
    (p) => p.courseId.toString() === courseId
  );
  const initialCompleted = progressEntry?.completedLessons ?? [];

  return (
    <VideoPlayer
      courseId={courseId}
      courseSlug={slug}
      courseTitle={course.title}
      curriculum={course.curriculum}
      initialCompleted={initialCompleted}
    />
  );
}
