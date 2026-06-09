import crypto from 'crypto';
import { connectDB } from './db';
import { User } from '@/models/User';
import type { DeviceClass } from './device';

/**
 * Server-side active-session registry that makes the stateless JWT enforceable.
 *
 * Each login mints a unique `sessionId` stored per (user, deviceClass). A new
 * login of the same class overwrites that slot, so the previous device's
 * `sessionId` is no longer present — which is how we detect and kick it.
 */

/**
 * Replace the active session for this user's `deviceClass` and return the new
 * `sessionId` to embed in the JWT. Removes any prior entry of the same class so
 * a student can hold at most one mobile and one desktop session.
 */
export async function registerDeviceSession(
  userId: string,
  deviceClass: DeviceClass,
  userAgent: string | null | undefined
): Promise<string> {
  await connectDB();
  const sessionId = crypto.randomUUID();

  await User.updateOne(
    { _id: userId },
    {
      // Drop the existing session of this class, then add the fresh one.
      $pull: { deviceSessions: { deviceClass } },
    }
  );
  await User.updateOne(
    { _id: userId },
    {
      $push: {
        deviceSessions: {
          deviceClass,
          sessionId,
          userAgent: userAgent ?? undefined,
          lastLogin: new Date(),
        },
      },
    }
  );

  return sessionId;
}

/**
 * True when this token may still access protected resources.
 *
 * - Admins are exempt (never limited).
 * - A missing `sessionId` (token issued before this feature) is treated as
 *   inactive, forcing a one-time re-login.
 * - Otherwise the `sessionId` must still be present in the user's deviceSessions.
 */
export async function isSessionActive(
  userId: string,
  role: string,
  sessionId: string | undefined
): Promise<boolean> {
  if (role !== 'student') return true;
  if (!sessionId) return false;

  await connectDB();
  const user = await User.findById(userId)
    .select('deviceSessions')
    .lean<{ deviceSessions?: { sessionId: string }[] }>();

  return Boolean(user?.deviceSessions?.some((s) => s.sessionId === sessionId));
}
