import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';

async function requireAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin' ? session : null;
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const courses = await Course.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
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
