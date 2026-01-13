'use server';

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

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
          return { message: "Invalid credentials." };
        case "CallbackRouteError":
          return { message: "Account Suspended. Contact Support." };
        default:
          return { message: "Something went wrong." };
      }
    }
    throw error;
  }
}