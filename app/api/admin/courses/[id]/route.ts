import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { requirePerm } from '@/lib/permissions.server';

// Whitelist of client-editable course fields. Anything else in the body
// (e.g. enrolledCount, _id, role-ish junk) is dropped to prevent mass
// assignment of fields the admin form is not meant to touch.
const EDITABLE_FIELDS = [
  'title',
  'slug',
  'shortDescription',
  'longDescription',
  'thumbnail',
  'previewVideoId',
  'price',
  'isFree',
  'isPublished',
  'category',
  'level',
  'curriculum',
  'demoClasses',
] as const;

function pickCourseFields(body: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (body && typeof body === 'object') {
    const src = body as Record<string, unknown>;
    for (const key of EDITABLE_FIELDS) {
      if (key in src) out[key] = src[key];
    }
  }
  return out;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requirePerm('courses.view')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  await connectDB();
  const course = await Course.findById(id).lean();
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requirePerm('courses.edit')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  try {
    const body = await req.json();
    await connectDB();
    const course = await Course.findByIdAndUpdate(id, pickCourseFields(body), { new: true, runValidators: true });
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(course);
  } catch (err) {
    console.error('[admin/courses PUT]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requirePerm('courses.edit')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const body = await req.json();
  await connectDB();
  const course = await Course.findByIdAndUpdate(id, { $set: pickCourseFields(body) }, { new: true });
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(course);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await requirePerm('courses.delete')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  await connectDB();
  await Course.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
