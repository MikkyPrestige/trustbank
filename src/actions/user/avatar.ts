'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { revalidatePath } from "next/cache";


const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function updateAvatar(formData: FormData) {
   const { success, message, user } = await getAuthenticatedUser();

   if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

   if (!success || !user) {
        return { success: false, message };
    }

   const file = formData.get("file") as File;
    if (!file || file.size === 0) return { success: false, message: "No file selected" };

    if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: "File is too large. Max 10MB." };
    }

    let secureUrl = "";

    try {

        // 1. Upload to Cloudinary
        secureUrl = await uploadFileToCloud(file, "avatars");

        // 2. Update Database
        await db.user.update({
            where: { id: user.id },
            data: { image: secureUrl }
        });

    } catch (error: any) {
        console.error("Avatar Update Error:", error);
        return { success: false, message: error.message || "Failed to upload profile picture." };
    }

    // ✅ Revalidate outside try/catch
    revalidatePath("/dashboard");

    return { success: true, message: "Profile picture updated!", url: secureUrl };
}