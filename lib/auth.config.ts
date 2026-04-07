import type { NextAuthConfig, DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
  }
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/otp',
  },
};
