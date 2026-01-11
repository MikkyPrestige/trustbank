'use server';

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // This calls the Credentials provider we set up in src/auth.ts
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard", // Where to go on success
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { message: "Invalid credentials." };
        default:
          return { message: "Something went wrong." };
      }
    }
    // NextAuth throws a redirect error on success, we must re-throw it
    throw error;
  }
}