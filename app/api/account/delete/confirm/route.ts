import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { OtpCode } from '@/models/OtpCode';
import { User } from '@/models/User';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const BD_PHONE_RE = /^01[3-9]\d{8}$/;

/** Max wrong guesses before a code is burned — caps OTP brute-force. */
const MAX_OTP_ATTEMPTS = 5;

/**
 * Verify an account-deletion OTP and permanently delete the student's own
 * `User` document (self-service /delete flow). Mirrors the attempt-cap logic of
 * `verifyOtpCode` (lib/auth.ts) but NEVER creates a user — the login path does,
 * which would be exactly wrong here. Order/payment records are intentionally
 * retained for accounting.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Strict string typing — only plain strings ever reach the query (NoSQL
    // operator-injection defense), matching verifyOtpCode.
    const phone = (typeof body.phone === 'string' ? body.phone : '').trim();
    const code = typeof body.otp === 'string' ? body.otp.trim() : '';

    if (!BD_PHONE_RE.test(phone) || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Wrong OTP or OTP expired.' },
        { status: 400 }
      );
    }

    // Throttle verification attempts per phone and per IP.
    const perPhone = await rateLimit(`del-confirm:phone:${phone}`, 10, 60 * 60 * 1000);
    if (!perPhone.allowed) {
      return NextResponse.json(
        { success: false, error: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করো।' },
        { status: 429, headers: { 'Retry-After': String(perPhone.retryAfterSec) } }
      );
    }
    const perIp = await rateLimit(`del-confirm:ip:${clientIp(req)}`, 30, 60 * 60 * 1000);
    if (!perIp.allowed) {
      return NextResponse.json(
        { success: false, error: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করো।' },
        { status: 429, headers: { 'Retry-After': String(perIp.retryAfterSec) } }
      );
    }

    await connectDB();

    const otpRecord = await OtpCode.findOne({
      phone,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { success: false, error: 'Wrong OTP or OTP expired.' },
        { status: 400 }
      );
    }

    if (otpRecord.code !== code) {
      // Count the failed attempt; burn the code once the cap is reached so an
      // attacker can't keep guessing the same live code.
      const reachedCap = (otpRecord.attempts ?? 0) + 1 >= MAX_OTP_ATTEMPTS;
      await OtpCode.updateOne(
        { _id: otpRecord._id },
        reachedCap ? { $inc: { attempts: 1 }, $set: { used: true } } : { $inc: { attempts: 1 } }
      );
      return NextResponse.json(
        { success: false, error: 'Wrong OTP or OTP expired.' },
        { status: 400 }
      );
    }

    // Correct code — burn it, then delete the account. Never create a user here.
    await OtpCode.updateOne({ _id: otpRecord._id }, { used: true });
    await User.deleteOne({ phone });
    await OtpCode.deleteMany({ phone });

    return NextResponse.json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    console.error('[account-delete/confirm]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
