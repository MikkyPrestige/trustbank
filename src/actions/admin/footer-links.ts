'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";

export async function createFooterLink(formData: FormData) {
    const auth = await checkAdminAction();
    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: "Unauthorized" };
    }

    const label = formData.get("label") as string;
    const href = formData.get("href") as string;
    const column = formData.get("column") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    if (!label || !href) return { success: false, message: "Label and URL required" };

    try {
        await db.footerLink.create({ data: { label, href, column, order } });

        await logAdminAction(
            "CREATE_FOOTER_LINK",
            "NEW_FOOTER_LINK",
            {
                label,
                href,
                column,
                action: "Created Footer Link",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/');
        return { success: true, message: "Link added" };
    } catch (error) {
        return { success: false, message: "Failed to add link" };
    }
}


export async function deleteFooterLink(id: string) {
    const auth = await checkAdminAction();
    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const link = await db.footerLink.findUnique({ where: { id } });

        await db.footerLink.delete({ where: { id } });

        await logAdminAction(
            "DELETE_FOOTER_LINK",
            id,
            {
                label: link?.label || "Unknown",
                action: "Deleted Footer Link",
                admin: auth.session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/');
        return { success: true, message: "Link deleted" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}


export async function updateFooterLink(id: string, formData: FormData) {
    const auth = await checkAdminAction();
    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: "Unauthorized" };
    }

    const label = formData.get("label") as string;
    const href = formData.get("href") as string;
    const column = formData.get("column") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    if (!id || !label || !href) return { success: false, message: "Missing required fields" };

    try {
        const updatedLink = await db.footerLink.update({
            where: { id },
            data: { label, href, column, order }
        });

        await logAdminAction(
            "UPDATE_FOOTER_LINK",
            id,
            {
                label,
                href,
                column,
                order,
                action: "Updated Footer Link",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/');
        return { success: true, message: "Link updated successfully" };
    } catch (error) {
        console.error("Update Error:", error);
        return { success: false, message: "Failed to update link" };
    }
}


export async function updateFooterOrder(links: { id: string; order: number }[]) {
    const auth = await checkAdminAction();
    if (!auth.authorized) return { success: false, message: "Unauthorized" };

    try {
        await db.$transaction(
            links.map((link) =>
                db.footerLink.update({
                    where: { id: link.id },
                    data: { order: link.order },
                })
            )
        );

        revalidatePath('/');
        return { success: true, message: "Order saved" };
    } catch (error) {
        console.error("Order Update Error:", error);
        return { success: false, message: "Failed to save new order" };
    }
}