import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { stripLessonNotes } from '@/lib/course';
import type { ISection } from '@/models/Course';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const course = await Course.findOne({ slug, isPublished: true }).lean<{
      curriculum?: ISection[];
    }>();
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Lesson notes are enrolled-only — never expose them on the public API.
    if (course.curriculum) {
      course.curriculum = stripLessonNotes(course.curriculum);
    }

    return NextResponse.json(course);
  } catch (err) {
    console.error('[courses/slug]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
