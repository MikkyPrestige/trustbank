import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserStatus, KycStatus, UserRole } from "@prisma/client";
import { headers } from "next/headers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await db.user.findUnique({ where: { email } });

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (!passwordsMatch) return null;

          if (user.status === UserStatus.SUSPENDED) {
            throw new Error("Account Suspended. Contact Support.");
          }

          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,

    async signIn({ user }) {
      if (!user.id) return true;
      const dbUser = await db.user.findUnique({ where: { id: user.id } });
      if (dbUser && !dbUser.emailVerified) {
    throw new Error("Email not verified");
  }

      try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";
        const dbUser = await db.user.findUnique({ where: { id: user.id } });

        if (dbUser && dbUser.lastIp !== ip) {
          await db.user.update({
            where: { id: user.id },
            data: { lastIp: ip }
          });

          await db.notification.create({
            data: {
              userId: user.id,
              title: "New Login Detected",
              message: `We noticed a login from a new IP address (${ip}).`,
              type: "INFO",
              link: "/dashboard/settings",
              isRead: false
            }
          });
        }
      } catch (error) {
        console.error("Login Tracking Error:", error);
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.name = (user as any).fullName;
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.kycStatus = user.kycStatus;
        token.picture = user.image;
        token.version = (user as any).tokenVersion || 0;
      }

      if (token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: {
            fullName: true,
            tokenVersion: true,
            role: true,
            status: true,
            kycStatus: true,
            image: true
          }
        });

        if (!dbUser || (dbUser.tokenVersion ?? 0) !== (token.version as number)) {
          return null;
        }

        token.name = dbUser.fullName;
        token.role = dbUser.role;
        token.status = dbUser.status;
        token.kycStatus = dbUser.kycStatus;
        token.picture = dbUser.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.kycStatus = token.kycStatus as KycStatus;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});