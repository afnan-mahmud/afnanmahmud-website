import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';

interface PlainCourse {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  category?: string;
  level: string;
  enrolledCount: number;
}

export async function GET() {
  try {
    await connectDB();
    const raw = await Course.find({ isPublished: true })
      .select('title slug shortDescription thumbnail price isFree category level enrolledCount')
      .sort({ createdAt: -1 })
      .lean<PlainCourse[]>();

    const courses = raw.map((c) => ({
      _id: c._id.toString(),
      title: c.title,
      slug: c.slug,
      shortDescription: c.shortDescription ?? '',
      thumbnail: c.thumbnail ?? '',
      price: c.price,
      isFree: c.isFree,
      category: c.category ?? '',
      level: c.level,
      enrolledCount: c.enrolledCount,
    }));

    return NextResponse.json({ courses });
  } catch (err) {
    console.error('Courses API error:', err);
    return NextResponse.json({ courses: [], error: 'Failed to load courses' }, { status: 500 });
  }
}
