import { redirect } from 'next/navigation';
import AdminShell from '@/components/layout/AdminShell';
import { getAccess } from '@/lib/permissions.server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Source of truth for admin access. Middleware already blocks non-admins at the
  // edge; this resolves the viewer's fresh permissions for the sidebar + pages.
  const access = await getAccess();
  if (!access) redirect('/dashboard');

  return <AdminShell access={access}>{children}</AdminShell>;
}
