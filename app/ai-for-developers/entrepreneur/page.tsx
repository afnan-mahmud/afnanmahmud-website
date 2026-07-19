import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import SegmentLanding from '../_landing/SegmentLanding';
import { SEGMENT_GLOBAL_STYLES } from '../_landing/globalStyles';
import { entrepreneur } from '../segments/entrepreneur';

export const metadata: Metadata = {
  title: entrepreneur.meta.title,
  description: entrepreneur.meta.description,
  openGraph: {
    title: entrepreneur.meta.ogTitle,
    description: entrepreneur.meta.ogDescription,
    type: 'website',
  },
};

function enrolledDisplay(count: number): string {
  const rounded = Math.max(500, Math.ceil(count / 500) * 500);
  return `${rounded}+`;
}

export default async function EntrepreneurLandingPage() {
  await connectDB();
  const course = await Course.findOne({ slug: 'ai-for-developers' })
    .select('enrolledCount')
    .lean<{ enrolledCount?: number }>();
  const enrolledLabel = enrolledDisplay(course?.enrolledCount ?? 0);

  return (
    <>
      <style>{SEGMENT_GLOBAL_STYLES}</style>
      <SegmentLanding content={entrepreneur} enrolledLabel={enrolledLabel} />
    </>
  );
}
