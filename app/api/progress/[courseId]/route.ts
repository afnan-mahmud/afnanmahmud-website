import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Types } from 'mongoose';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;

    await connectDB();
    const user = await User.findById(session.user.id).select('progress').lean<{
      progress: { courseId: Types.ObjectId; completedLessons: string[] }[];
    }>();

    const entry = user?.progress?.find((p) => p.courseId.toString() === courseId);

    return NextResponse.json({ completedLessons: entry?.completedLessons ?? [] });
  } catch (err) {
    console.error('[progress GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await req.json();
    const lessonId = body.lessonId as string;

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    type ProgressEntry = { courseId: { toString(): string }; completedLessons: string[] };
    const progressEntry = (user.progress as ProgressEntry[]).find(
      (p) => p.courseId.toString() === courseId
    );

    if (progressEntry) {
      if (!progressEntry.completedLessons.includes(lessonId)) {
        progressEntry.completedLessons.push(lessonId);
      }
    } else {
      user.progress.push({
        courseId: new Types.ObjectId(courseId),
        completedLessons: [lessonId],
      });
    }

    await user.save();

    const updated = (user.progress as ProgressEntry[]).find((p) => p.courseId.toString() === courseId);
    return NextResponse.json({ completedLessons: updated?.completedLessons ?? [] });
  } catch (err) {
    console.error('[progress POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
