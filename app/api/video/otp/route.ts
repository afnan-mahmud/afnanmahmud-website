import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { vdocipherConfigured, getOtp, buildWatermark } from '@/lib/vdocipher';
import { isSessionActive } from '@/lib/auth-device';
import type { ICourse } from '@/models/Course';

interface LeanCourse {
  _id: { toString(): string };
  previewVideoId?: string;
  curriculum: ICourse['curriculum'];
}

/**
 * Mint a VdoCipher playback OTP for a single videoId, gated by course ownership.
 *
 * Defense in depth: even though the watch page already redirects non-owners, we
 * re-resolve the videoId against published-course data and re-check ownership
 * here, so a leaked videoId can't be played by a non-buyer and this endpoint
 * can't be used as an open proxy to arbitrary VdoCipher videos.
 *
 * Preview lessons and a course's previewVideoId are playable without purchase.
 */
export async function POST(req: NextRequest) {
  try {
    if (!vdocipherConfigured()) {
      return NextResponse.json(
        { error: 'Video playback is not configured' },
        { status: 503 }
      );
    }

    const { videoId } = (await req.json().catch(() => ({}))) as { videoId?: string };
    if (!videoId || typeof videoId !== 'string') {
      return NextResponse.json({ error: 'videoId required' }, { status: 400 });
    }

    await connectDB();

    // Find the published course that references this videoId (as a lesson or preview).
    const course = await Course.findOne({
      isPublished: true,
      $or: [{ previewVideoId: videoId }, { 'curriculum.lessons.videoId': videoId }],
    })
      .select('previewVideoId curriculum')
      .lean<LeanCourse>();

    if (!course) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Classify the videoId: a course preview or a preview-flagged lesson is public;
    // any other lesson requires ownership of this course.
    const isCoursePreview = course.previewVideoId === videoId;
    const matchedLesson = course.curriculum
      .flatMap((s) => s.lessons)
      .find((l) => l.videoId === videoId);
    const isPublic = isCoursePreview || Boolean(matchedLesson?.isPreview);

    const session = await auth();

    // Enforce the device limit: a kicked student session can't mint OTPs even if
    // it still holds a (stale) JWT cookie. Admins are exempt inside isSessionActive.
    if (session?.user?.id) {
      const active = await isSessionActive(
        session.user.id,
        session.user.role,
        session.user.sessionId
      );
      if (!active) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 });
      }
    }

    let watermarkLabel = 'protected';

    if (!isPublic) {
      // Paid lesson — must be logged in and own this course.
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const user = await User.findById(session.user.id)
        .select('phone purchasedCourses')
        .lean<{ phone: string; purchasedCourses: { toString(): string }[] }>();

      const courseId = course._id.toString();
      const owns = user?.purchasedCourses?.some((id) => id.toString() === courseId);
      if (!owns) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      watermarkLabel = user?.phone ?? watermarkLabel;
    } else if (session?.user?.id) {
      // Public preview, but a logged-in viewer still gets their own number burned in.
      const user = await User.findById(session.user.id).select('phone').lean<{ phone: string }>();
      watermarkLabel = user?.phone ?? watermarkLabel;
    }

    const { otp, playbackInfo } = await getOtp(videoId, {
      annotate: buildWatermark(watermarkLabel),
    });

    return NextResponse.json({ otp, playbackInfo });
  } catch (err) {
    console.error('[video/otp]', err);
    return NextResponse.json({ error: 'Could not load video' }, { status: 500 });
  }
}
