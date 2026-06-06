import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import CourseTabs from '@/components/course/CourseTabs';
import EnrollButton from '@/components/course/EnrollButton';
import { stripLessonNotes } from '@/lib/course';
import TrackEvent from '@/components/tracking/TrackEvent';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Users, BookOpen, BarChart2, Play } from 'lucide-react';
import type { Metadata } from 'next';
import type { ISection } from '@/models/Course';

const sg = Space_Grotesk({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const LEVEL_COLOR: Record<string, string> = {
  beginner: '#4ade80',
  intermediate: '#f59e0b',
  advanced: '#f87171',
};

function countLessons(curriculum: ISection[]): number {
  return curriculum.reduce((sum, s) => sum + s.lessons.length, 0);
}

function deriveWhatYouLearn(curriculum: ISection[]): string[] {
  return curriculum.map((s) => s.sectionTitle).filter(Boolean);
}

interface PlainCourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  thumbnail?: string;
  previewVideoId?: string;
  price: number;
  isFree: boolean;
  category?: string;
  level: string;
  curriculum: ISection[];
  enrolledCount: number;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const course = await Course.findOne({ slug, isPublished: true }).lean<PlainCourse>();
  if (!course) return { title: 'Course Not Found | Afnan Mahmud' };
  const description = course.shortDescription ?? `Enroll in ${course.title} and learn real-world skills with Afnan Mahmud.`;
  return {
    title: `${course.title} | Afnan Mahmud`,
    description,
    openGraph: {
      title: `${course.title} | Afnan Mahmud`,
      description,
      url: `/courses/${slug}`,
      images: course.thumbnail ? [{ url: course.thumbnail, alt: course.title }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} | Afnan Mahmud`,
      description,
      images: course.thumbnail ? [course.thumbnail] : [],
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  await connectDB();

  const course = await Course.findOne({ slug, isPublished: true }).lean<PlainCourse>();
  if (!course) notFound();

  const session = await auth();
  let alreadyPurchased = false;
  if (session?.user?.id) {
    const user = await User.findById(session.user.id).select('purchasedCourses').lean<{ purchasedCourses: unknown[] }>();
    alreadyPurchased = user?.purchasedCourses?.some((id) => id?.toString() === course._id.toString()) ?? false;
  }

  const totalLessons = countLessons(course.curriculum);
  const whatYouLearn = deriveWhatYouLearn(course.curriculum);

  // Lesson notes are for enrolled students only — strip them before the
  // curriculum is handed to the public client component.
  const publicCurriculum = stripLessonNotes(course.curriculum);

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <TrackEvent
        event="ViewContent"
        params={{
          value: course.price,
          currency: 'BDT',
          content_ids: [course.slug],
          content_name: course.title,
          content_type: 'product',
        }}
      />
      {/* ── HERO ── */}
      <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '64px' }}>
        {/* Blurred thumbnail background */}
        {course.thumbnail && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${course.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.12,
              filter: 'blur(24px)',
              transform: 'scale(1.1)',
            }}
          />
        )}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0.95) 80%, #0a0a0a 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '60px 24px 56px',
          }}
        >
          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {course.category && (
              <span
                className={sg.className}
                style={{
                  padding: '4px 12px',
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: '100px',
                  color: '#a5b4fc',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                {course.category}
              </span>
            )}
            <span
              className={sg.className}
              style={{
                padding: '4px 12px',
                background: `${LEVEL_COLOR[course.level]}18`,
                border: `1px solid ${LEVEL_COLOR[course.level]}44`,
                borderRadius: '100px',
                color: LEVEL_COLOR[course.level],
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>
          </div>

          {/* Title */}
          <h1
            className={sg.className}
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              fontWeight: 800,
              color: '#f1f5f9',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              maxWidth: '800px',
              marginBottom: '16px',
            }}
          >
            {course.title}
          </h1>

          {/* Short description */}
          {course.shortDescription && (
            <p
              className={inter.className}
              style={{ color: '#a1a1aa', fontSize: '1.0625rem', lineHeight: 1.7, maxWidth: '680px', marginBottom: '28px' }}
            >
              {course.shortDescription}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {[
              { icon: Users, value: `${course.enrolledCount.toLocaleString()}`, label: 'Enrolled' },
              { icon: BookOpen, value: `${totalLessons}`, label: 'Lessons' },
              { icon: BarChart2, value: `${course.curriculum.length}`, label: 'Sections' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={16} color="#6366f1" />
                <span className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9375rem' }}>{value}</span>
                <span className={inter.className} style={{ color: '#52525b', fontSize: '0.875rem' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 80px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '48px',
        }}
      >
        {/* ── TABS ── */}
        <CourseTabs
          longDescription={course.longDescription}
          curriculum={publicCurriculum}
          whatYouLearn={whatYouLearn}
        />

        {/* ── PREVIEW VIDEO ── */}
        {course.previewVideoId && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Play size={18} color="#22d3ee" />
              <h2 className={sg.className} style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
                Free Preview Lesson
              </h2>
            </div>
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.07)',
                position: 'relative',
                paddingBottom: '56.25%',
                background: '#000',
              }}
            >
              <iframe
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                src={`https://www.youtube.com/embed/${course.previewVideoId}`}
                title={`${course.title} Preview`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* ── ENROLL SECTION ── */}
        <div>
          <h2
            className={sg.className}
            style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.375rem', marginBottom: '24px', letterSpacing: '-0.01em' }}
          >
            Enroll in This Course
          </h2>
          <EnrollButton
            courseId={course._id.toString()}
            courseSlug={course.slug}
            courseTitle={course.title}
            courseThumbnail={course.thumbnail}
            price={course.price}
            isFree={course.isFree}
            totalLessons={totalLessons}
            totalSections={course.curriculum.length}
            alreadyPurchased={alreadyPurchased}
          />
        </div>
      </div>
    </div>
  );
}
