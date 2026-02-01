'use server';

import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import { sendPasswordResetEmail } from "@/lib/mail";
import crypto from "crypto";

export async function requestPasswordReset(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const settings = await getSiteSettings();
  const siteName = settings.site_name || "Trust Capital";

  if (!email || !email.includes("@")) {
    return { message: "Please enter a valid email address." };
  }

  // 1. Check if user exists
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return { success: true, message: "If an account exists, a reset link has been sent." };
  }

  // 2. Generate Secure Token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000);

  // 3. Save to DB
  await db.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expires
    }
  });

  // 4. Send Email
  await sendPasswordResetEmail(user.email, token, siteName);

  return { success: true, message: "Check your email for the reset link." };
}