'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const pressSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().min(1, "Summary is required").max(2000),
  category: z.string().max(50).optional(),
  link: z.string().max(500).optional(),
  date: z.string().optional(),
});

export async function createPressRelease(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

const rawData = {
  title: formData.get("title") as string,
  summary: formData.get("summary") as string,
  category: formData.get("category") as string,
  link: formData.get("link") as string,
  date: formData.get("date") as string,
};

const validated = pressSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
  title: rawTitle,
  summary: rawSummary,
  category: rawCategory,
  link: rawLink,
  date: dateStr,
} = validated.data;

const title = sanitize(rawTitle);
const summary = sanitize(rawSummary);
const category = rawCategory ? sanitize(rawCategory) : "";
const link = rawLink ? sanitize(rawLink) : "";

    try {
        await db.pressRelease.create({
            data: {
                title, summary, category, link,
                date: dateStr ? new Date(dateStr) : new Date()
            }
        });

        await logAdminAction(
            "CREATE_PRESS_RELEASE",
            "NEW_PRESS_RELEASE",
            {
                title,
                category,
                action: "Published Press Release",
                admin: session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/press');
        revalidatePath('/press');
        return { success: true, message: "Press release published" };
    } catch (error) {
        return { success: false, message: "Failed to create release" };
    }
}

export async function updatePressRelease(id: string, formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

   const rawData = {
  title: formData.get("title") as string,
  summary: formData.get("summary") as string,
  category: formData.get("category") as string,
  link: formData.get("link") as string,
  date: formData.get("date") as string,
};

const validated = pressSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
  title: rawTitle,
  summary: rawSummary,
  category: rawCategory,
  link: rawLink,
  date: dateStr,
} = validated.data;

const title = sanitize(rawTitle);
const summary = sanitize(rawSummary);
const category = rawCategory ? sanitize(rawCategory) : "";
const link = rawLink ? sanitize(rawLink) : "";

    try {
        await db.pressRelease.update({
            where: { id },
            data: {
                title, summary, category, link,
                date: dateStr ? new Date(dateStr) : undefined
            }
        });

        await logAdminAction(
            "UPDATE_PRESS_RELEASE",
            id,
            {
                title,
                action: "Updated Press Release",
                admin: session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/press');
        revalidatePath('/press');
        return { success: true, message: "Press release updated" };
    } catch (error) {
        return { success: false, message: "Failed to update" };
    }
}

export async function deletePressRelease(id: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    try {
        const release = await db.pressRelease.findUnique({ where: { id } });

        await db.pressRelease.delete({ where: { id } });

        await logAdminAction(
            "DELETE_PRESS_RELEASE",
            id,
            {
                title: release?.title || "Unknown",
                action: "Deleted Press Release",
                admin: session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/admin/press');
        revalidatePath('/press');
        return { success: true, message: "Deleted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}