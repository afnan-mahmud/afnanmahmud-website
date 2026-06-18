import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { requirePerm } from '@/lib/permissions.server';

export async function GET() {
  if (!await requirePerm('courses.view')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const courses = await Course.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  if (!await requirePerm('courses.create')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const body = await req.json();
    await connectDB();
    const course = await Course.create(body);
    return NextResponse.json(course, { status: 201 });
  } catch (err) {
    console.error('[admin/courses POST]', err);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
