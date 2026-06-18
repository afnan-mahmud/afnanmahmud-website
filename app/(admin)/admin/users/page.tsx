import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { getAccess } from '@/lib/permissions.server';
import { firstAllowedPath } from '@/lib/permissions';
import TeamTable, { type AdminRow } from '@/components/admin/TeamTable';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const access = await getAccess();
  if (!access) redirect('/dashboard');
  if (!access.isOwner) redirect(firstAllowedPath(access));

  await connectDB();
  type LeanAdmin = {
    _id: unknown;
    name: string;
    phone: string;
    isOwner?: boolean;
    permissions?: string[];
    createdAt: Date;
  };

  const raw = await User.find({ role: 'admin' })
    .select('name phone isOwner permissions createdAt')
    .sort({ createdAt: 1 })
    .lean<LeanAdmin[]>();

  const admins: AdminRow[] = raw.map((a) => ({
    _id: String(a._id),
    name: a.name,
    phone: a.phone,
    isOwner: a.isOwner === true,
    permissions: a.permissions ?? [],
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
  }));

  return <TeamTable admins={admins} currentUserId={access.userId} />;
}
