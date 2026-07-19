import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import SegmentLanding from '../_landing/SegmentLanding';
import { SEGMENT_GLOBAL_STYLES } from '../_landing/globalStyles';
import { student } from '../segments/student';

export const metadata: Metadata = {
  title: student.meta.title,
  description: student.meta.description,
  openGraph: {
    title: student.meta.ogTitle,
    description: student.meta.ogDescription,
    type: 'website',
  },
};

function enrolledDisplay(count: number): string {
  const rounded = Math.max(500, Math.ceil(count / 500) * 500);
  return `${rounded}+`;
}

export default async function StudentLandingPage() {
  await connectDB();
  const course = await Course.findOne({ slug: 'ai-for-developers' })
    .select('enrolledCount')
    .lean<{ enrolledCount?: number }>();
  const enrolledLabel = enrolledDisplay(course?.enrolledCount ?? 0);

  return (
    <>
      <style>{SEGMENT_GLOBAL_STYLES}</style>
      <SegmentLanding content={student} enrolledLabel={enrolledLabel} />
    </>
  );
}
