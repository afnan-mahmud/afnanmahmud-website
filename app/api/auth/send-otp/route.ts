import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sendOtp } from '@/lib/sms';
import { OtpCode } from '@/models/OtpCode';

const BD_PHONE_RE = /^01[3-9]\d{8}$/;

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone: string = (body.phone ?? '').trim();

    if (!BD_PHONE_RE.test(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number. Use Bangladesh format: 01XXXXXXXXX' },
        { status: 400 }
      );
    }

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
