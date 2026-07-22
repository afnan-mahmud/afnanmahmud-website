import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { StudentNote } from '@/models/StudentNote';
import { requirePerm } from '@/lib/permissions.server';

const MAX_LEN = 2000;

/** POST — append a call note to a student's log. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const access = await requirePerm('students.notes');
  if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: 'Note likhun' }, { status: 400 });

  await connectDB();

  const student = await User.findById(id).select('_id').lean<{ _id: unknown } | null>();
  if (!student) return NextResponse.json({ error: 'Student paoa jayni' }, { status: 404 });

  const author = await User.findById(access.userId).select('name').lean<{ name?: string } | null>();

  const note = await StudentNote.create({
    student: id,
    author: access.userId,
    authorName: author?.name || 'Admin',
    text: text.slice(0, MAX_LEN),
  });

  return NextResponse.json({
    note: {
      id: String(note._id),
      text: note.text,
      authorName: note.authorName,
      createdAt: new Date(note.createdAt).toISOString(),
    },
  });
}
