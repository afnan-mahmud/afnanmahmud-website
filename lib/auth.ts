import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from './db';
import { OtpCode } from '@/models/OtpCode';
import { User } from '@/models/User';
import { authConfig } from './auth.config';
import { deviceClass } from './device';
import { registerDeviceSession } from './auth-device';

export async function verifyOtpCode(
  phone: string,
  code: string
): Promise<{ id: string; phone: string; role: string; name: string } | null> {
  await connectDB();

  const otpRecord = await OtpCode.findOne({
    phone,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) return null;
  if (otpRecord.code !== code) return null;

  await OtpCode.updateOne({ _id: otpRecord._id }, { used: true });

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name: phone, phone, role: 'student' });
  }

  return {
    id: user._id.toString(),
    phone: user.phone,
    role: user.role,
    name: user.name,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials, request) {
        const phone = credentials?.phone as string | undefined;
        const otp = credentials?.otp as string | undefined;
        if (!phone || !otp) return null;
        const result = await verifyOtpCode(phone, otp);
        if (!result) return null;

        // Students are capped to one mobile + one desktop session; registering a
        // new session of a class kicks the previous device of that class. Admins
        // are exempt and carry no sessionId.
        let sessionId: string | undefined;
        if (result.role === 'student') {
          const ua = request?.headers?.get('user-agent');
          sessionId = await registerDeviceSession(result.id, deviceClass(ua), ua);
        }

        return {
          id: result.id,
          name: result.name,
          email: null,
          role: result.role,
          sessionId,
        };
      },
    }),
  ],
});
