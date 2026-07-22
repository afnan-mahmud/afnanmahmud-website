import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SavedReply } from '@/models/SavedReply';
import { requirePerm } from '@/lib/permissions.server';

const MAX_TITLE = 60;
const MAX_TEXT = 2000;

/** GET — every saved reply, newest first. */
export async function GET() {
  if (!(await requirePerm('whatsapp.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();

  const replies = await SavedReply.find()
    .sort({ createdAt: -1 })
    .lean<{ _id: unknown; title: string; text: string }[]>();

  return NextResponse.json({
    replies: replies.map((r) => ({ id: String(r._id), title: r.title, text: r.text })),
  });
}

/** POST — add a saved reply. Gated on the same permission as sending. */
export async function POST(req: NextRequest) {
  const access = await requirePerm('whatsapp.reply');
  if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { title?: string; text?: string };
  const title = body.title?.trim();
  const text = body.text?.trim();
  if (!title) return NextResponse.json({ error: 'Title likhun' }, { status: 400 });
  if (!text) return NextResponse.json({ error: 'Message likhun' }, { status: 400 });

  await connectDB();

  const reply = await SavedReply.create({
    title: title.slice(0, MAX_TITLE),
    text: text.slice(0, MAX_TEXT),
    createdBy: access.userId,
  });

  return NextResponse.json({
    reply: { id: String(reply._id), title: reply.title, text: reply.text },
  });
}
