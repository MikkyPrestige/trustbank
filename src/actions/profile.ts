'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized" };

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string; // Read-only usually, but let's see

  if (!fullName || fullName.length < 3) {
    return { message: "Name must be at least 3 characters." };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { fullName },
    });

    revalidatePath("/dashboard"); // Refresh sidebar name
    return { message: "Profile updated successfully!", success: true };
  } catch (error) {
    return { message: "Failed to update profile." };
  }
}


// ... existing imports

export async function updatePin(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { message: "Unauthorized" };

  const pin = formData.get("pin") as string;

  // Validation: Must be exactly 4 digits
  if (!/^\d{4}$/.test(pin)) {
    return { message: "PIN must be exactly 4 digits." };
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: { transactionPin: pin },
    });

    return { message: "Security PIN updated successfully!", success: true };
  } catch (error) {
    console.error(error);
    return { message: "Failed to update PIN." };
  }
}