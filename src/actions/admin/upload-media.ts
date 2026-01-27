'use server';

import { uploadFileToCloud } from "@/lib/utils/upload";

export async function uploadMediaAction(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { error: "No file provided" };
    }

    const url = await uploadFileToCloud(file, "settings");

    return { success: true, url };
  } catch (error: any) {
    console.error("Upload Action Error:", error);
    return { error: error.message || "Upload failed" };
  }
}