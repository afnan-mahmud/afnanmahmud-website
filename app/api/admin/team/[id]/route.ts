import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireOwner } from '@/lib/permissions.server';
import { normalizePermissions } from '@/lib/permissions';

/** Update a scoped admin's name + permissions (owner-only). */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { name?: string; permissions?: unknown };

  await connectDB();
  const target = await User.findById(id).select('role isOwner');
  if (!target || target.role !== 'admin') {
    return NextResponse.json({ error: 'Admin paoa jayni.' }, { status: 404 });
  }
  if (target.isOwner === true) {
    return NextResponse.json({ error: 'Owner-er permission edit kora jabe na.' }, { status: 403 });
  }

  if (typeof body.name === 'string' && body.name.trim()) {
    target.name = body.name.trim();
  }
  target.permissions = normalizePermissions(body.permissions);
  // Normalise a legacy admin (isOwner absent) to an explicit scoped admin.
  target.isOwner = false;
  await target.save();

  return NextResponse.json({ success: true });
}

/** Remove a scoped admin (owner-only). Cannot remove an owner or yourself. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await requireOwner();
  if (!owner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  if (id === owner.userId) {
    return NextResponse.json({ error: 'Nijeke remove kora jabe na.' }, { status: 400 });
  }

  await connectDB();
  const target = await User.findById(id).select('role isOwner');
  if (!target || target.role !== 'admin') {
    return NextResponse.json({ error: 'Admin paoa jayni.' }, { status: 404 });
  }
  if (target.isOwner === true) {
    return NextResponse.json({ error: 'Owner ke remove kora jabe na.' }, { status: 403 });
  }

  await User.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}
