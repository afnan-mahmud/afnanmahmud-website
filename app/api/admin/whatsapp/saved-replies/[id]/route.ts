import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { SavedReply } from '@/models/SavedReply';
import { requirePerm } from '@/lib/permissions.server';

/** DELETE — remove a saved reply (shared list, so anyone who can send can prune it). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requirePerm('whatsapp.reply'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  await connectDB();

  const deleted = await SavedReply.findByIdAndDelete(id);
  if (!deleted) return NextResponse.json({ error: 'Saved reply paoa jayni' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
