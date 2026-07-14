import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppContact } from '@/models/WhatsAppContact';
import { requirePerm } from '@/lib/permissions.server';
import type { IUser } from '@/models/User';

/** GET — conversation list for the inbox, newest activity first. */
export async function GET() {
  if (!(await requirePerm('whatsapp.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const contacts = await WhatsAppContact.find()
    .sort({ lastMessageAt: -1 })
    .limit(200)
    .populate<{ student: Pick<IUser, 'name'> | null }>('student', 'name')
    .lean<
      {
        _id: unknown;
        waId: string;
        profileName?: string;
        student?: { name?: string } | null;
        lastMessageAt: Date;
        lastMessageText?: string;
        lastInboundAt?: Date;
        unreadCount: number;
      }[]
    >();

  const conversations = contacts.map((c) => ({
    waId: c.waId,
    name: c.profileName || c.student?.name || c.waId,
    studentName: c.student?.name ?? null,
    lastMessageText: c.lastMessageText ?? '',
    lastMessageAt: c.lastMessageAt,
    lastInboundAt: c.lastInboundAt ?? null,
    unreadCount: c.unreadCount,
  }));

  return NextResponse.json({ conversations });
}
