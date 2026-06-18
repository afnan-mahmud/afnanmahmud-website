import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * Determine the real image type from the file's magic bytes, ignoring the
 * client-supplied MIME (which is trivially spoofable). Returns the extension
 * to use, or null if the bytes are not a known/allowed image — which blocks
 * disguised payloads (HTML/SVG/scripts renamed to .jpg).
 */
function sniffImageExt(buf: Buffer): string | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  )
    return 'png';
  if (buf.length >= 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
    return 'gif';
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && // RIFF
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50 // WEBP
  )
    return 'webp';
  return null;
}

// Only allow a small set of known sub-folders to avoid path traversal.
const ALLOWED_FOLDERS = ['avatars', 'thumbnails'] as const;
type Folder = (typeof ALLOWED_FOLDERS)[number];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Early reject on the claimed type, but the real check is the magic bytes below.
    if (!EXT_BY_TYPE[file.type]) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, or GIF allowed' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 5MB' }, { status: 400 });
    }

    const requested = String(formData.get('folder') ?? 'avatars');
    const folder: Folder = (ALLOWED_FOLDERS as readonly string[]).includes(requested)
      ? (requested as Folder)
      : 'avatars';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Authoritative type check: derive the extension from the actual bytes.
    const ext = sniffImageExt(buffer);
    if (!ext) {
      return NextResponse.json({ error: 'File is not a valid image' }, { status: 400 });
    }

    // Save to public/uploads/<folder>/<uuid>.<ext> so it's served as a static file.
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${folder}/${filename}`;

    // Only avatar uploads should change the user's profile picture.
    if (folder === 'avatars') {
      await connectDB();
      await User.findByIdAndUpdate(session.user.id, { avatar: url });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
