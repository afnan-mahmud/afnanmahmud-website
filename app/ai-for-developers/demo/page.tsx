import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import DemoClassClient, { type DemoClassItem } from './DemoClassClient';

const COURSE_SLUG = 'ai-for-developers';
const isDev = process.env.NODE_ENV !== 'production';

// Always render against live DB so admin edits to demo classes show immediately.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Demo Class — AI for Developers',
  description: 'AI for Developers কোর্সের ফ্রি ডেমো ক্লাস দেখুন — এনরোল করার আগেই টিচিং স্টাইল যাচাই করুন।',
};

interface LeanCourse {
  title: string;
  price: number;
  demoClasses?: Array<{ _id: string; title: string; description?: string; videoId: string; durationLabel?: string }>;
}

export default async function DemoClassPage() {
  await connectDB();

  const course = await Course.findOne(
    isDev ? { slug: COURSE_SLUG } : { slug: COURSE_SLUG, isPublished: true }
  )
    .select('title price demoClasses')
    .lean<LeanCourse>();

  const demoClasses: DemoClassItem[] = (course?.demoClasses ?? []).map((d) => ({
    id: String(d._id),
    title: d.title,
    description: d.description ?? '',
    videoId: d.videoId,
    durationLabel: d.durationLabel ?? '',
  }));

  return (
    <DemoClassClient
      courseTitle={course?.title ?? 'AI for Developers'}
      price={course?.price ?? 990}
      demoClasses={demoClasses}
    />
  );
}
