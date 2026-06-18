import { Schema, model, models } from 'mongoose';
import { connectDB } from './db';

interface IRateLimit {
  key: string;
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  resetAt: { type: Date, required: true },
});
// Auto-purge expired windows.
RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit = models.RateLimit ?? model<IRateLimit>('RateLimit', RateLimitSchema);

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSec: number;
}

/**
 * Fixed-window rate limit backed by MongoDB. Durable across restarts and
 * correct for the single-process PM2 deployment (and any future scale-out).
 *
 * Fails OPEN: if the limiter itself errors, the request is allowed — a rate
 * limiter must never take down login/SMS for legitimate users.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  try {
    await connectDB();
    const now = Date.now();

    const doc = await RateLimit.findOne({ key });

    // No window yet, or the previous window has elapsed → start a fresh one.
    if (!doc || doc.resetAt.getTime() <= now) {
      await RateLimit.findOneAndUpdate(
        { key },
        { $set: { count: 1, resetAt: new Date(now + windowMs) } },
        { upsert: true }
      );
      return { allowed: true, retryAfterSec: Math.ceil(windowMs / 1000) };
    }

    if (doc.count >= limit) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((doc.resetAt.getTime() - now) / 1000)),
      };
    }

    await RateLimit.updateOne({ key }, { $inc: { count: 1 } });
    return {
      allowed: true,
      retryAfterSec: Math.max(1, Math.ceil((doc.resetAt.getTime() - now) / 1000)),
    };
  } catch {
    // Fail open — never block legitimate traffic on a limiter fault.
    return { allowed: true, retryAfterSec: 0 };
  }
}

/** Best-effort client IP from reverse-proxy headers (Nginx on the VPS). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
}
