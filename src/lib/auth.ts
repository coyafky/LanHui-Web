import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { jwtCallback, sessionCallback } from "@/lib/auth-callbacks";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: credentials.username as string },
              { email: credentials.username as string },
            ],
            status: "active",
          },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return jwtCallback({
        token: token as Record<string, unknown>,
        user: user ? { id: (user as { id: string }).id, role: (user as { role: string }).role } : undefined,
      });
    },
    async session({ session, token }) {
      return sessionCallback({
        session,
        token: token as Record<string, unknown>,
      });
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
});
