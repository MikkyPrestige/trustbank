'use server';

import { checkAdminAction } from "@/lib/auth/admin-auth";
import { uploadFileToCloud } from "@/lib/utils/upload";
import { fileTypeFromBuffer } from 'file-type';

async function isValidImage(file: File): Promise<boolean> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await fileTypeFromBuffer(buffer);
  return result?.mime.startsWith('image/') ?? false;
}

export async function uploadMediaAction(formData: FormData) {
  try {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session?.user) {
      return { success: false, message: "Unauthorized" };
    }

   const file = formData.get("file") as File;
  if (!file || file.size === 0) {
    return { success: false, message: "No file provided" };
  }

   if (!(await isValidImage(file))) {
    return { success: false, message: "Only image files (JPEG, PNG, WebP) are allowed." };
  }

   const url = await uploadFileToCloud(file, "settings");
    return { success: true, url };
  } catch (error: any) {
    console.error("Upload Action Error:", error);
    return { success: false, message: error.message || "Upload failed" };
  }
}