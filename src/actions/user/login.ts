'use server';

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { headers } from "next/headers";
import { checkMaintenanceMode, getSecurityStatus } from "@/lib/security";
import { getSiteSettings } from "@/lib/content/get-settings";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { sendSecurityEmail } from "@/lib/mail";
import { UAParser } from "ua-parser-js";
import { db } from "@/lib/db";
import { compare } from "bcryptjs";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const settings = await getSiteSettings();
  const siteName = settings.site_name || "Trust Bank";
  const MAX_ATTEMPTS = settings.auth_login_limit || 5;

  // 1. Validate Input
  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: validated.error.issues[0].message };
  }

  const { email, password } = loginSchema.parse(rawData);
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "Unknown IP";
  const userAgent = headersList.get("user-agent") || "";

  // 2. ACTIVE DEFENSE (IP Rate Limit)
  const security = await getSecurityStatus(ip);
  if (security.isBlocked) {
      await logAdminAction("IP_BLOCKED", email, { reason: "Rate Limit Exceeded", ip }, "CRITICAL", "BLOCKED");
      return {
          message: `Too many failed attempts. Please try again in ${security.remainingTime} minutes.`
      };
  }

  // 3. MAINTENANCE CHECK
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

  // 4. PRE-CHECK & NOTIFICATION
  try {
      const user = await db.user.findUnique({ where: { email } });

     if (user && !user.emailVerified) {
         return {
             message: "Account not verified.",
             redirect: `/verify-email?email=${encodeURIComponent(email)}`
         };
      }

      // Check if user exists and password is correct
      if (user && user.passwordHash && (await compare(password, user.passwordHash))) {

          // A. SUCCESS! RESET COUNTERS NOW
          await db.user.update({
              where: { email },
              data: { failedLoginAttempts: 0 }
          });

          // B. SEND NOTIFICATION
          const parser = new UAParser(userAgent);
          const result = parser.getResult();
          const device = `${result.browser.name || 'Web'} on ${result.os.name || 'Unknown OS'}`;

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

  // 5. ATTEMPT SIGN IN
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          await logAdminAction("LOGIN_FAILED", email, { reason: "Invalid Credentials", ip }, "WARNING", "FAILED");

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

          // Check IP Status again to be safe
          const freshStatus = await getSecurityStatus(ip);
          if (freshStatus.isBlocked) {
             if (userForNotify) {
                 try {
                     await db.notification.create({
                         data: {
                             userId: userForNotify.id,
                             title: "Network Access Suspended",
                             message: `Security Alert: We detected unusual activity from your IP (${ip}). Access temporarily blocked for ${freshStatus.remainingTime} minutes.`,
                             type: "WARNING",
                             link: "/security",
                             isRead: false
                         }
                     });
                 } catch (nErr) {
                     console.error("Failed to create block notification", nErr);
                 }
             }
             return { message: `Too many failed attempts. Access blocked for ${freshStatus.remainingTime} minutes.` };
          }

          // Return remaining attempts based on USER counter, not just IP
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

                 // 'void' to fire-and-forget (don't wait for email to send)
                void sendSecurityEmail(email, userForNotify.fullName || "Client", "LOCKED", siteName);
             }

             return { message: "Account locked due to excessive failed attempts. Contact support." };
          }

          if (remaining <= 3) {
             return { message: `Invalid credentials. Warning: ${remaining} attempts remaining.` };
          } else {
             return { message: "Invalid credentials. Please check your email and password." };
          }

        case "CallbackRouteError":
          return { message: "Account Access Restricted." };
        default:
          return { message: "Authentication failed." };
      }
    }
    throw error;
  }
}