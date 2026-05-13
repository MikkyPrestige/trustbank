'use server';

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { headers } from "next/headers";
import { checkMaintenanceMode } from "@/lib/security";
import { getSiteSettings } from "@/lib/content/get-settings";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { sendSecurityEmail } from "@/lib/mail";
import { UAParser } from "ua-parser-js";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";
import { loginLimiter } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/utils/security-logger";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  callbackUrl: z.string().optional(),
});

const DUMMY_HASH = "$2a$12$L7R.qM.Yx.GzO7KzP8W1u.p9X5E5G7R9T2k1l3m4n5o6p7q8r9s1t";

export async function login(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const settings = await getSiteSettings();
  const siteName = settings.site_name;
  const MAX_ATTEMPTS = settings.auth_login_limit || 5;
  const LOCKOUT_MINUTES = 15;

  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: validated.error.issues[0].message };
  }

  const { email, password, callbackUrl } = loginSchema.parse(rawData);
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "Unknown IP";
  const safeIp = sanitize(ip);
  const userAgent = headersList.get("user-agent") || "";

  const isMaintenance = await checkMaintenanceMode();
  if (isMaintenance) {
      const existingUser = await db.user.findUnique({
          where: { email },
          select: { role: true }
      });
      if (existingUser && existingUser.role !== 'ADMIN' && existingUser.role !== 'SUPER_ADMIN') {
          return { message: "System is currently under maintenance. Please try again later." };
      }
      if (!existingUser) return { message: "System is currently under maintenance." };
  }

  try {
      const user = await db.user.findUnique({ where: { email } });

      // Account-level brute-force lockout check
if (user) {
    // Check if the account is currently locked (time-based lockout)
    if (user.lockUntil && user.lockUntil > new Date()) {
        const remainingMs = user.lockUntil.getTime() - Date.now();
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        return { message: `Account temporarily locked. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.` };
    }
    // If the lockout period has passed, clear the lock and reset attempts
    if (user.lockUntil && user.lockUntil <= new Date()) {
        await db.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockUntil: null }
        });
    }
}

      const hashToCompare = user?.passwordHash || DUMMY_HASH;
    const isPasswordCorrect = await compare(password, hashToCompare);

    if (!user || !isPasswordCorrect) {
        // DO Nothing
    }

     if (user && !user.emailVerified) {
         return {
             message: "Invalid email or password. If you haven't verified your account, check your inbox or request a new verification link.",
         };
      }

      if (user && user.passwordHash && (await compare(password, user.passwordHash))) {
          await db.user.update({
              where: { email },
              data: { failedLoginAttempts: 0, lockUntil: null }
          });

          const parser = new UAParser(userAgent);
          const result = parser.getResult();
          const device = sanitize(`${result.browser.name || 'Web'} on ${result.os.name || 'Unknown OS'}`);

          await db.notification.create({
              data: {
                  userId: user.id,
                  title: "New Login Detected",
                  message: `Secure login from ${device}. If this wasn't you, change your password immediately.`,
                  type: "SECURITY",
                  link: "/settings/security",
                  isRead: false
              }
          });
      }
  } catch (err) {
      console.error("Login Pre-Check Error:", err);
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/dashboard",
    });
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          await logAdminAction("LOGIN_FAILED", email, { reason: "Invalid Credentials", ip: safeIp }, "WARNING", "FAILED");

          await logSecurityEvent({
  action: "LOGIN_FAILED",
  level: "WARNING",
  details: { email, ip: safeIp },
  ipAddress: safeIp,
  userAgent,
});

          let attempts = 0;
          let userForNotify = null;

          try {
              const updatedUser = await db.user.update({
                  where: { email },
                  data: { failedLoginAttempts: { increment: 1 } },
                  select: { id: true, failedLoginAttempts: true, fullName: true }
              });

              attempts = updatedUser.failedLoginAttempts;
              userForNotify = updatedUser;
          } catch (e) { }

          // If this attempt just locked the account, set lockUntil
if (attempts >= MAX_ATTEMPTS) {
    await db.user.update({
        where: { email },
        data: { lockUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) }
    });
}

          const remaining = Math.max(0, MAX_ATTEMPTS - attempts);
          if (remaining === 0) {
             if (userForNotify) {
                 await db.notification.create({
                     data: {
                         userId: userForNotify.id,
                         title: "Account Security Alert",
                         message: "Your account has been locked due to excessive failed login attempts. Please contact support.",
                         type: "CRITICAL",
                         link: "/support",
                         isRead: false
                     }
                 });
                void sendSecurityEmail(email, userForNotify.fullName || "Client", "LOCKED", siteName);
             }

             await logSecurityEvent({
  action: "ACCOUNT_LOCKED",
  level: "CRITICAL",
  details: { email, ip: safeIp, lockUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) },
  ipAddress: safeIp,
  userAgent,
  userId: userForNotify?.id,
});

             const lockMinutes: number = LOCKOUT_MINUTES;
        return { message: `Account locked due to excessive failed attempts. Please try again in ${lockMinutes} minute${lockMinutes !== 1 ? 's' : ''}.` };
          }

         // Redis‑based IP rate limiting (counts only failed attempts)
const { success: ipAllowed, remaining: ipRemaining, reset } = await loginLimiter.limit(ip);
const ipBlocked = !ipAllowed;

if (ipBlocked) {
    await logAdminAction("IP_BLOCKED", email, { reason: "Rate Limit Exceeded", ip: safeIp }, "CRITICAL", "BLOCKED");

    await logSecurityEvent({
  action: "IP_BLOCKED",
  level: "CRITICAL",
  details: { email, reason: "Rate Limit Exceeded", ip: safeIp },
  ipAddress: safeIp,
  userAgent,
});

    const retrySeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    const retryMinutes = Math.ceil(retrySeconds / 60);
    return {
        message: `Too many failed attempts. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`
    };
}

// Show IP‑level attempts remaining (minus the one just used)
const ipAttemptsLeft = Math.max(0, ipRemaining - 1);

let ipNote: string;
if (ipAttemptsLeft > 0) {
    ipNote = `IP will be blocked after ${ipAttemptsLeft} more attempt${ipAttemptsLeft !== 1 ? 's' : ''}.`;
} else {
    const retrySeconds = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
    const retryMinutes = Math.ceil(retrySeconds / 60);
    ipNote = `Your IP is now blocked. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`;
}

if (remaining <= 3) {
    return { message: `Invalid credentials. ${remaining} account attempt${remaining !== 1 ? 's' : ''} remaining. ${ipNote}` };
} else {
    return { message: `Invalid credentials. ${ipNote}` };
}

        case "CallbackRouteError":
          return { message: "Account Access Restricted." };
        default:
          return { message: "Authentication failed." };
      }
    }

    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
    throw error;
    }

    throw error;
  }
}