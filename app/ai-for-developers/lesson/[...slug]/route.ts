import { NextResponse, type NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { auth } from '@/lib/auth';
import { isSessionActive } from '@/lib/auth-device';
import { connectDB } from '@/lib/db';
import { Course } from '@/models/Course';
import { User } from '@/models/User';

/**
 * Serves the hand-authored motion-graphics lesson pages that live on disk as
 * standalone HTML files under `app/ai-for-developers/lesson/<module>/<name>.html`.
 *
 * Why a route handler and not a page: each file is a complete document (own
 * <html>, GSAP, inline styles), so it is streamed as-is instead of being wrapped
 * in the app's React shell. Dropping a new `.html` file into a module folder is
 * all it takes to publish another lesson — no code change.
 *
 *   /ai-for-developers/lesson/module_3/Lesson 3.9 - chat_system_explanation_motion
 *
 * Access is gated the same way paid video is: signed in, session not superseded
 * on another device, and the course present in `User.purchasedCourses`.
 *
 * NOTE: these files sit inside `app/` but are never imported, so the standalone
 * build won't trace them automatically — `outputFileTracingIncludes` in
 * next.config.ts copies them into the server bundle.
 */

/** Course slugs whose buyers may read these lessons. */
const ACCESS_SLUGS = ['ai-for-developers'];

const LESSON_ROOT = path.join(process.cwd(), 'app', 'ai-for-developers', 'lesson');

/** Conservative whitelist: letters, digits, space, dot, dash, underscore. */
const SAFE_SEGMENT = /^[A-Za-z0-9 ._-]+$/;

interface LeanUser {
  phone: string;
  purchasedCourses: { toString(): string }[];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;

  // ---- resolve the file first, so a bad path 404s without touching the DB ----
  const segments = slug.map((s) => decodeURIComponent(s));
  if (
    segments.length < 2 ||
    segments.some((s) => !SAFE_SEGMENT.test(s) || s === '.' || s === '..')
  ) {
    return new NextResponse('Not found', { status: 404 });
  }

  // The URL may or may not carry the .html extension; both resolve to the file.
  const last = segments[segments.length - 1].replace(/\.html$/i, '');
  const filePath = path.join(LESSON_ROOT, ...segments.slice(0, -1), `${last}.html`);

  // Belt and braces against traversal even though segments are whitelisted.
  if (!path.resolve(filePath).startsWith(path.resolve(LESSON_ROOT) + path.sep)) {
    return new NextResponse('Not found', { status: 404 });
  }

  let html: string;
  try {
    html = await fs.readFile(filePath, 'utf8');
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }

  // ---- auth ----
  const returnUrl = req.nextUrl.pathname + req.nextUrl.search;
  const session = await auth();

  if (!session?.user?.id) {
    const url = new URL('/auth/otp', req.url);
    url.searchParams.set('returnUrl', returnUrl);
    return NextResponse.redirect(url);
  }

  const active = await isSessionActive(
    session.user.id,
    session.user.role,
    session.user.sessionId
  );
  if (!active) {
    return NextResponse.redirect(new URL('/auth/otp?reason=other_device', req.url));
  }

  // ---- ownership ----
  await connectDB();

  const user = await User.findById(session.user.id)
    .select('phone purchasedCourses')
    .lean<LeanUser>();

  let allowed = session.user.role === 'admin';

  if (!allowed && user) {
    const courses = await Course.find({ slug: { $in: ACCESS_SLUGS } })
      .select('_id')
      .lean<{ _id: { toString(): string } }[]>();
    const owned = new Set(user.purchasedCourses?.map((id) => id.toString()) ?? []);
    allowed = courses.some((c) => owned.has(c._id.toString()));
  }

  if (!allowed) {
    // Not a buyer → back to the course landing so they can enroll.
    return NextResponse.redirect(new URL('/ai-for-developers', req.url));
  }

  return new NextResponse(withWatermark(html, user?.phone), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // Per-student content behind auth: never cache in a shared cache, never index.
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

/**
 * Stamp the buyer's phone number into a corner of the page, mirroring the moving
 * watermark on VdoCipher playback — a screen-recorded copy stays traceable.
 * Purely additive overlay: `pointer-events:none` so it can't touch the lesson UI.
 */
function withWatermark(html: string, phone: string | undefined): string {
  if (!phone) return html;

  const safe = phone.replace(/[<&]/g, '');
  const overlay = `
<div style="position:fixed;right:10px;bottom:8px;z-index:2147483647;pointer-events:none;
  font:500 11px/1.4 system-ui,sans-serif;color:rgba(255,255,255,.28);letter-spacing:.04em;
  mix-blend-mode:difference;user-select:none">${safe}</div>`;

  return html.includes('</body>')
    ? html.replace('</body>', `${overlay}\n</body>`)
    : html + overlay;
}
