import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client";

// Define the schema for input validation
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

          // Verify Password
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) {
            // Return user object to be used in JWT callback
            return user;
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    // 1. Add custom fields (role, status) to the token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status; // Critical for "Capability-Based" checks
        token.kycVerified = user.kycVerified;
      }
      return token;
    },
    // 2. Expose the token fields to the client-side session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.status = token.status as UserStatus;
        session.user.kycVerified = token.kycVerified as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom login page we will build later
  },
  session: {
    strategy: "jwt",
  },
});