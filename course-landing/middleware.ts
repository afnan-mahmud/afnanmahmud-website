import { NextResponse } from 'next/server';

// This subdomain has no authenticated areas. A local (no-op) middleware keeps
// Next from inferring the repo-root middleware.ts (the main app's NextAuth gate
// for /dashboard + /admin) as this app's middleware — those routes don't exist
// here, and we don't want NextAuth or its secrets bundled into this edge runtime.
export function middleware() {
  return NextResponse.next();
}

// Matches only an internal sentinel path that is never requested, so the
// middleware effectively never runs. (An empty array can't be statically parsed.)
export const config = { matcher: ['/__noop_never_match__'] };
