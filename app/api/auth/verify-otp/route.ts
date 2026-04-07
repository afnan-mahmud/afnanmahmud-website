import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpCode } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone: string = (body.phone ?? '').trim();
    const code: string = (body.code ?? '').trim();

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Phone and code are required' },
        { status: 400 }
      );
    }

    const result = await verifyOtpCode(phone, code);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'OTP expired or invalid' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: result.id,
      role: result.role,
    });
  } catch (err) {
    console.error('[verify-otp]', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
