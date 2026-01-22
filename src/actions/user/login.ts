'use server';

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());

  // 1. Validate Input Format
  const validated = loginSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: validated.error.issues[0].message };
  }

  const { email, password } = validated.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });

  } catch (error) {
    // 2. Handle Auth Errors
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid email or password." };
        case "CallbackRouteError":
          return { message: "Account Access Restricted. Please contact support." };
        default:
          return { message: "Authentication failed. Please try again." };
      }
    }

    // 3. IMPORTANT: Rethrow Redirects
    // Next.js uses errors to trigger redirects. If we catch it, the redirect fails.
    throw error;
  }
}