import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireOwner } from '@/lib/permissions.server';
import { normalizePermissions } from '@/lib/permissions';

/** List all admin team members (owner-only). */
export async function GET() {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await connectDB();

  type LeanAdmin = {
    _id: unknown;
    name: string;
    phone: string;
    isOwner?: boolean;
    permissions?: string[];
    createdAt: Date;
  };

  const admins = await User.find({ role: 'admin' })
    .select('name phone isOwner permissions createdAt')
    .sort({ createdAt: 1 })
    .lean<LeanAdmin[]>();

  return NextResponse.json(
    admins.map((a) => ({
      _id: String(a._id),
      name: a.name,
      phone: a.phone,
      isOwner: a.isOwner === true,
      permissions: a.permissions ?? [],
      createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
    }))
  );
}

/** Create a new scoped admin (owner-only). */
export async function POST(req: NextRequest) {
  if (!(await requireOwner())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    phone?: string;
    permissions?: unknown;
  };

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'নাম দিতে হবে।' }, { status: 400 });
  }

  const normalised = (body.phone ?? '').replace(/[\s\-]/g, '').replace(/^\+?880/, '0');
  if (!/^01[3-9]\d{8}$/.test(normalised)) {
    return NextResponse.json({ error: 'সঠিক ফোন নম্বর দাও (01XXXXXXXXX)।' }, { status: 400 });
  }

  const permissions = normalizePermissions(body.permissions);

  await connectDB();

  const existing = await User.findOne({ phone: normalised }).select('_id').lean();
  if (existing) {
    return NextResponse.json(
      { error: 'এই ফোন নম্বর দিয়ে আগে থেকেই একটি অ্যাকাউন্ট আছে।' },
      { status: 409 }
    );
  }

  await User.create({
    name,
    phone: normalised,
    role: 'admin',
    isOwner: false,
    permissions,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
