import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import CourseForm from '@/components/admin/CourseForm';

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'admin') redirect('/dashboard');

  const { id } = await params;
  await connectDB();
  type LeanCourse = {
    _id: unknown;
    title: string;
    slug: string;
    shortDescription?: string;
    longDescription?: string;
    category?: string;
    level: string;
    price: number;
    isFree: boolean;
    isPublished: boolean;
    previewVideoId?: string;
    thumbnail?: string;
    curriculum?: Array<{
      sectionTitle: string;
      lessons?: Array<{ _id?: string; title: string; videoId?: string; duration?: string; isPreview?: boolean }>;
    }>;
  };

  const raw = await Course.findById(id).lean<LeanCourse>();
  if (!raw) notFound();

  const course = {
    _id: String(raw._id),
    title: raw.title,
    slug: raw.slug,
    shortDescription: raw.shortDescription ?? '',
    longDescription: raw.longDescription ?? '',
    category: raw.category ?? '',
    level: raw.level,
    price: raw.price,
    isFree: raw.isFree,
    isPublished: raw.isPublished,
    previewVideoId: raw.previewVideoId ?? '',
    thumbnail: raw.thumbnail ?? '',
    curriculum: (raw.curriculum ?? []).map((s) => ({
      sectionTitle: s.sectionTitle,
      lessons: (s.lessons ?? []).map((l) => ({
        _id: l._id ?? String(Math.random()),
        title: l.title,
        videoId: l.videoId ?? '',
        duration: l.duration ?? '',
        isPreview: l.isPreview ?? false,
      })),
    })),
  };

  return <CourseForm mode="edit" initial={course} />;
}
