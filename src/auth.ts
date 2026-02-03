import NextAuth from "next-auth";
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
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user) return null;

          // 1. Check Password
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (!passwordsMatch) return null;

          // 2. Check Status (Login Guard)
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
    // LOGIN TRACKING
    async signIn({ user }) {
      if (!user.id) return true;

      try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";

        // Fetch current DB data (User might have changed since session started)
        const dbUser = await db.user.findUnique({ where: { id: user.id } });

        if (dbUser) {
          // If IP changed, update it.
          if (dbUser.lastIp !== ip) {
             await db.user.update({
                where: { id: user.id },
                data: { lastIp: ip }
             });

             // Notify the USER
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
        }
      } catch (error) {
        console.error("Login Tracking Error:", error);
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // 1. Initial Sign In
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.kycStatus = user.kycStatus;

        // Capture the version at login
        token.version = (user as any).tokenVersion || 0;
      }

      // 2. Subsequent Requests (The Gatekeeper)
      if (token.sub) {
         // Fetch the latest security data for this user
         const dbUser = await db.user.findUnique({
            where: { id: token.sub },
            select: {
                tokenVersion: true,
                role: true,
                status: true,
                kycStatus: true
            }
         });

         // SECURITY CHECK: Version Mismatch or User Deleted
         if (!dbUser || (dbUser.tokenVersion ?? 0) !== (token.version as number)) {
             return null;
         }

         // Sync latest status
         token.role = dbUser.role;
         token.status = dbUser.status;
         token.kycStatus = dbUser.kycStatus;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.status = token.status as UserStatus;
        session.user.kycStatus = token.kycStatus as KycStatus;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});