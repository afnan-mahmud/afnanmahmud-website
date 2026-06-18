import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { connectDB } from '@/lib/db';
import { sendOtp } from '@/lib/sms';
import { OtpCode } from '@/models/OtpCode';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const BD_PHONE_RE = /^01[3-9]\d{8}$/;

/** Cryptographically-secure 6-digit code (not the predictable Math.random). */
function generateCode(): string {
  return randomInt(100000, 1000000).toString();
}

function tooMany(retryAfterSec: number) {
  return NextResponse.json(
    { success: false, error: 'অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করো।' },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
  );
}

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

    // Throttle to stop SMS-bombing / cost abuse and OTP spam to a victim.
    //  - 1 SMS per 60s and at most 5/hour to a single phone number
    //  - at most 20/hour from a single client IP (shared NAT tolerant)
    const cooldown = await rateLimit(`otp:cooldown:${phone}`, 1, 60 * 1000);
    if (!cooldown.allowed) return tooMany(cooldown.retryAfterSec);

    const perPhone = await rateLimit(`otp:phone:${phone}`, 5, 60 * 60 * 1000);
    if (!perPhone.allowed) return tooMany(perPhone.retryAfterSec);

    const perIp = await rateLimit(`otp:ip:${clientIp(req)}`, 20, 60 * 60 * 1000);
    if (!perIp.allowed) return tooMany(perIp.retryAfterSec);

    await connectDB();

    await OtpCode.deleteMany({ phone });

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OtpCode.create({ phone, code, expiresAt, used: false });

    const sent = await sendOtp(phone, code);
    if (!sent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send SMS. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    console.error('[send-otp]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
