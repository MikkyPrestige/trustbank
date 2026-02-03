'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";

export async function createPressRelease(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const category = formData.get("category") as string;
    const link = formData.get("link") as string;
    const dateStr = formData.get("date") as string;

    if (!title || !summary) return { success: false, message: "Title and Summary required" };

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

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const category = formData.get("category") as string;
    const link = formData.get("link") as string;
    const dateStr = formData.get("date") as string;

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
        // Fetch first for logging context
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