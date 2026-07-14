import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppContact } from '@/models/WhatsAppContact';
import { WhatsAppMessage } from '@/models/WhatsAppMessage';
import { requirePerm } from '@/lib/permissions.server';
import { sendText, isConfigured, isWithinWindow } from '@/lib/whatsapp';
import type { IUser } from '@/models/User';

/** GET — the thread's messages (ascending); marks the conversation as read. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ waId: string }> }) {
  if (!(await requirePerm('whatsapp.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { waId } = await params;
  await connectDB();

  const contact = await WhatsAppContact.findOneAndUpdate(
    { waId },
    { $set: { unreadCount: 0 } },
    { new: true }
  )
    .populate<{ student: Pick<IUser, 'name' | 'phone'> | null }>('student', 'name phone')
    .lean<{
      waId: string;
      profileName?: string;
      student?: { name?: string; phone?: string } | null;
      lastInboundAt?: Date;
    } | null>();

  if (!contact) return NextResponse.json({ error: 'Conversation nei' }, { status: 404 });

  const messages = await WhatsAppMessage.find({ waId })
    .sort({ timestamp: 1 })
    .limit(500)
    .lean<
      {
        _id: unknown;
        direction: 'in' | 'out';
        type: string;
        text?: string;
        mediaPath?: string;
        mediaMime?: string;
        status?: string;
        error?: string;
        timestamp: Date;
      }[]
    >();

  return NextResponse.json({
    contact: {
      waId: contact.waId,
      name: contact.profileName || contact.student?.name || contact.waId,
      studentName: contact.student?.name ?? null,
      lastInboundAt: contact.lastInboundAt ?? null,
      canReply: isWithinWindow(contact.lastInboundAt),
    },
    messages: messages.map((m) => ({
      id: String(m._id),
      direction: m.direction,
      type: m.type,
      text: m.text ?? '',
      // Serve media through the auth-gated media route (see that route for why
      // the raw /uploads/... path 404s under `output: standalone`).
      mediaPath: m.mediaPath ? `/api/admin/whatsapp/media/${m.mediaPath.split('/').pop()}` : null,
      mediaMime: m.mediaMime ?? null,
      status: m.status ?? null,
      error: m.error ?? null,
      timestamp: m.timestamp,
    })),
  });
}

/** POST — send a free-form text reply (only inside the 24h window). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ waId: string }> }) {
  if (!(await requirePerm('whatsapp.reply'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { waId } = await params;

  if (!isConfigured()) {
    return NextResponse.json({ error: 'WhatsApp API configure kora nei' }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as { text?: string };
  const text = body.text?.trim();
  if (!text) return NextResponse.json({ error: 'Message likhun' }, { status: 400 });

  await connectDB();

  const contact = await WhatsAppContact.findOne({ waId });
  if (!contact) return NextResponse.json({ error: 'Conversation nei' }, { status: 404 });

  if (!isWithinWindow(contact.lastInboundAt)) {
    return NextResponse.json(
      { error: '24-ghontar window shesh — customer notun message na dile free-form reply pathano jabe na.' },
      { status: 409 }
    );
  }

  let waMessageId: string;
  try {
    waMessageId = await sendText(waId, text);
  } catch (err) {
    console.error('[whatsapp] reply failed', err);
    return NextResponse.json({ error: 'Send fail holo, abar try korun' }, { status: 502 });
  }

  const now = new Date();
  const message = await WhatsAppMessage.create({
    contact: contact._id,
    waId,
    waMessageId,
    direction: 'out',
    type: 'text',
    text,
    status: 'sent',
    timestamp: now,
  });

  contact.lastMessageAt = now;
  contact.lastMessageText = text.slice(0, 200);
  await contact.save();

  return NextResponse.json({
    message: {
      id: String(message._id),
      direction: 'out',
      type: 'text',
      text,
      mediaPath: null,
      mediaMime: null,
      status: 'sent',
      error: null,
      timestamp: now,
    },
  });
}
