import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { WhatsAppContact } from '@/models/WhatsAppContact';
import { WhatsAppMessage } from '@/models/WhatsAppMessage';
import { requirePerm } from '@/lib/permissions.server';
import {
  isConfigured,
  isWithinWindow,
  localPhoneToWaId,
  sendEnrollFollowup,
  sendText,
} from '@/lib/whatsapp';

/**
 * Message a student straight from the students / abandoned-students table.
 *
 * Unlike the inbox reply route this does not require an existing conversation —
 * an abandoned lead has usually never written to us — so the `WhatsAppContact`
 * is upserted here and the sent message lands in the normal inbox thread.
 *
 * Two modes, because WhatsApp only allows free-form text inside the 24h
 * customer-service window:
 *  - `{ text }`     → free-form, rejected with 409 once the window has closed.
 *  - `{ template }` → the approved `enroll_followup` UTILITY template, always
 *                     allowed and the only way to open a cold conversation.
 */

/** Stored as the message body for template sends (the template has no variables). */
const FOLLOWUP_PREVIEW = '[Template] Enroll follow-up';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('whatsapp.reply'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!isConfigured()) {
    return NextResponse.json({ error: 'WhatsApp API configure kora nei' }, { status: 503 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { text?: string; template?: boolean };
  const text = body.text?.trim();
  const useTemplate = body.template === true;
  if (!useTemplate && !text) {
    return NextResponse.json({ error: 'Message likhun' }, { status: 400 });
  }

  await connectDB();

  const student = await User.findById(id)
    .select('name phone')
    .lean<{ _id: unknown; name: string; phone: string } | null>();
  if (!student) return NextResponse.json({ error: 'Student paoa jayni' }, { status: 404 });

  const waId = localPhoneToWaId(student.phone);
  const existing = await WhatsAppContact.findOne({ waId }).select('lastInboundAt').lean<{
    lastInboundAt?: Date;
  } | null>();

  if (!useTemplate && !isWithinWindow(existing?.lastInboundAt)) {
    return NextResponse.json(
      {
        error:
          '24-ghontar window bondho — free-form text pathano jabe na. Follow-up template diye conversation open korun.',
        needsTemplate: true,
      },
      { status: 409 }
    );
  }

  let waMessageId: string;
  try {
    waMessageId = useTemplate
      ? await sendEnrollFollowup(student.phone)
      : await sendText(waId, text as string);
  } catch (err) {
    console.error('[admin/students/whatsapp] send failed', err);
    return NextResponse.json({ error: 'Send fail holo, abar try korun' }, { status: 502 });
  }

  const now = new Date();
  const messageText = useTemplate ? FOLLOWUP_PREVIEW : (text as string);

  const contact = await WhatsAppContact.findOneAndUpdate(
    { waId },
    {
      $set: {
        student: id,
        lastMessageAt: now,
        lastMessageText: messageText.slice(0, 200),
      },
      // waId comes from the filter on insert; only seed the rest.
      $setOnInsert: { profileName: student.name, unreadCount: 0 },
    },
    { new: true, upsert: true }
  );

  const message = await WhatsAppMessage.create({
    contact: contact._id,
    waId,
    waMessageId,
    direction: 'out',
    type: 'text',
    text: messageText,
    status: 'sent',
    timestamp: now,
  });

  return NextResponse.json({
    message: {
      id: String(message._id),
      direction: 'out',
      type: 'text',
      text: messageText,
      mediaPath: null,
      mediaMime: null,
      status: 'sent',
      error: null,
      timestamp: now.toISOString(),
    },
  });
}
