import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { WhatsAppContact } from '@/models/WhatsAppContact';
import { requirePerm } from '@/lib/permissions.server';

/** GET — total conversations with unread messages, for the sidebar badge. */
export async function GET() {
  if (!(await requirePerm('whatsapp.view'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();
  const count = await WhatsAppContact.countDocuments({ unreadCount: { $gt: 0 } });
  return NextResponse.json({ count });
}
