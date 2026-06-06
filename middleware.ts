import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  const isAdminArea = pathname.startsWith('/admin');
  const isDashboardArea = pathname.startsWith('/dashboard');

  // Not signed in → send to OTP, remembering where they were headed.
  if (!session) {
    if (isAdminArea || isDashboardArea) {
      const url = new URL('/auth/otp', req.url);
      url.searchParams.set('returnUrl', pathname + search);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Signed in: the admin and student portals are kept strictly separate.
  // Non-admins (students) can never enter the admin portal.
  if (isAdminArea && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  // Admins live in the admin portal; bounce them out of the student area.
  if (isDashboardArea && role === 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
