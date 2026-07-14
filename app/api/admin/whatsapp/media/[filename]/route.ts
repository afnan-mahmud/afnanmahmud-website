import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { requirePerm } from '@/lib/permissions.server';

/**
 * Serve a downloaded WhatsApp media file to authorized admins.
 *
 * The webhook writes media under `process.cwd()/public/uploads/whatsapp/`, but
 * with `output: 'standalone'` the production server serves static `public/`
 * assets from a build-time snapshot (`.next/standalone/public/`) — so files
 * written at runtime 404 there. Reading them back through this route (from the
 * SAME `process.cwd()` base the webhook wrote to) makes serving independent of
 * how static assets are hosted, and keeps customer media behind auth instead of
 * a public `/uploads/...` URL.
 */

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  '3gp': 'video/3gpp',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  amr: 'audio/amr',
  pdf: 'application/pdf',
};

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  if (!(await requirePerm('whatsapp.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { filename } = await params;

  // Only ever a bare filename in our uploads dir — reject any path trickery.
  if (!/^[A-Za-z0-9._-]+$/.test(filename) || filename.includes('..')) {
    return NextResponse.json({ error: 'Bad filename' }, { status: 400 });
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream';

  try {
    const buf = await readFile(join(process.cwd(), 'public', 'uploads', 'whatsapp', filename));
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buf.length),
        'Cache-Control': 'private, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
