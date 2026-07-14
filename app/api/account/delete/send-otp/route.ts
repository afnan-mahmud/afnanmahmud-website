import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { connectDB } from '@/lib/db';
import { sendDeleteOtp } from '@/lib/sms';
import { OtpCode } from '@/models/OtpCode';
import { User } from '@/models/User';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const BD_PHONE_RE = /^01[3-9]\d{8}$/;

/** Cryptographically-secure 6-digit code. */
function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { success: false, error: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করো।' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

/**
 * Send an account-deletion OTP to a student's own phone (ownership proof for the
 * self-service /delete flow). To prevent phone-number enumeration and SMS-cost
 * abuse, the SMS is only sent when an account with that phone actually exists —
 * but the response is always the same generic success either way.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone: string = (typeof body.phone === 'string' ? body.phone : '').trim();

    if (!BD_PHONE_RE.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number. Use Bangladesh format: 01XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Same throttling as login OTP: stop SMS-bombing / cost abuse and OTP spam.
    const cooldown = await rateLimit(`del-otp:cooldown:${phone}`, 1, 60 * 1000);
    if (!cooldown.allowed) return tooMany(cooldown.retryAfterSec);

    const perPhone = await rateLimit(`del-otp:phone:${phone}`, 5, 60 * 60 * 1000);
    if (!perPhone.allowed) return tooMany(perPhone.retryAfterSec);

    const perIp = await rateLimit(`del-otp:ip:${clientIp(req)}`, 20, 60 * 60 * 1000);
    if (!perIp.allowed) return tooMany(perIp.retryAfterSec);

    await connectDB();

    // Only send when the account exists — but never reveal whether it does.
    const user = await User.findOne({ phone }).select('_id').lean();
    if (user) {
      await OtpCode.deleteMany({ phone });

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      await OtpCode.create({ phone, code, expiresAt, used: false });

      await sendDeleteOtp(phone, code);
    }

    // Generic response regardless of account existence (anti-enumeration).
    return NextResponse.json({
      success: true,
      message: 'Jodi ei number e account thake, tobe OTP pathano hoyeche.',
    });
  } catch (err) {
    console.error('[account-delete/send-otp]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
