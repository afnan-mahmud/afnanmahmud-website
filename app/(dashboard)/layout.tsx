import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isSessionActive } from '@/lib/auth-device';
import DashboardShell from '@/components/layout/DashboardShell';

/**
 * Server-side guard for the whole student area. Enforces the device limit: if a
 * student's session has been superseded by a login on another device of the same
 * class, its sessionId is no longer active and we send them back to sign in with a
 * reason flag. Admins are exempt (and are bounced out of /dashboard by middleware).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user?.role === 'student') {
    const active = await isSessionActive(
      session.user.id,
      session.user.role,
      session.user.sessionId
    );
    if (!active) redirect('/auth/otp?reason=other_device');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
