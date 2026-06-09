import type { NextAuthConfig, DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    /** Active-session id for device-limit enforcement (students only). */
    sessionId?: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
      sessionId?: string;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: string;
    sessionId?: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [],
  // Self-hosted behind a reverse proxy (Nginx on the VPS): Auth.js otherwise
  // defaults trustHost to false in production and throws `UntrustedHost` on
  // every auth request. We terminate TLS at our own proxy, so trust the host.
  trustHost: true,
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.sessionId = user.sessionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.sessionId = token.sessionId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/otp',
  },
};
