import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from './auth';
import { connectDB } from './db';
import { User } from '@/models/User';
import { can, firstAllowedPath, type Access } from './permissions';

interface LeanAccessUser {
  _id: { toString(): string };
  role: string;
  isOwner?: boolean;
  permissions?: string[];
}

/**
 * Resolve the current viewer's admin access, read fresh from the DB so that
 * permission changes apply immediately. Returns `null` when the viewer is not
 * an admin.
 *
 * Ownership is explicit: only `isOwner === true` is an owner. An absent/false
 * flag means a scoped admin governed by `permissions`. (Owners are designated
 * via `scripts/set-owner.ts`; new team admins are created with `isOwner:false`.)
 * We never auto-promote here — doing so would silently escalate every
 * pre-existing admin to full access.
 */
export const getAccess = cache(async function getAccess(): Promise<Access | null> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') return null;

  await connectDB();
  const user = await User.findById(session.user.id)
    .select('role isOwner permissions')
    .lean<LeanAccessUser>();

  if (!user || user.role !== 'admin') return null;

  return {
    isOwner: user.isOwner === true,
    permissions: user.permissions ?? [],
    userId: user._id.toString(),
  };
});

/**
 * API-route guard. Returns the resolved access when the viewer holds `perm`
 * (owner bypasses), otherwise `null` — callers respond 403 on `null`.
 */
export async function requirePerm(perm: string): Promise<Access | null> {
  const access = await getAccess();
  if (!can(access, perm)) return null;
  return access;
}

/** Owner-only guard for team management. */
export async function requireOwner(): Promise<Access | null> {
  const access = await getAccess();
  return access?.isOwner ? access : null;
}

/**
 * Page guard for admin server components: redirects a non-admin to the student
 * portal and an admin lacking `perm` to their first allowed page. Returns the
 * resolved access so the page can additionally gate action controls.
 */
export async function requirePage(perm: string): Promise<Access> {
  const access = await getAccess();
  if (!access) redirect('/dashboard');
  if (!can(access, perm)) redirect(firstAllowedPath(access));
  return access;
}
