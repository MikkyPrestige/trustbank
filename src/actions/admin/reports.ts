'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";

// --- CREATE ---
export async function createReport(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const summary = formData.get("summary") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const type = formData.get("type") as string;
    const dateStr = formData.get("date") as string;

    if (!title || !fileUrl) return { success: false, message: "Title and File URL are required" };

    try {
        await db.financialReport.create({
            data: {
                title, summary, fileUrl, type,
                date: dateStr ? new Date(dateStr) : new Date()
            }
        });

        await logAdminAction(
            "CREATE_REPORT",
            "NEW_REPORT",
            { title, type, admin: session.user.email },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/investors');
        revalidatePath('/investors');
        return { success: true, message: "Report published" };
    } catch (error) {
        return { success: false, message: "Failed to create report" };
    }
}

// --- DELETE ---
export async function deleteReport(id: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    try {
        const report = await db.financialReport.findUnique({ where: { id } });

        if (!report) return { success: false, message: "Report not found" };

        // 2. Delete
        await db.financialReport.delete({ where: { id } });

        await logAdminAction(
            "DELETE_REPORT",
            id,
            {
                action: "DELETE_REPORT",
                title: report.title,
                admin: session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/admin/investors');
        revalidatePath('/investors');
        return { success: true, message: "Report deleted" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}

// 'use server';

// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { checkAdminAction } from "@/lib/auth/admin-auth";

// // --- CREATE ---
// export async function createReport(formData: FormData) {
//     const auth = await checkAdminAction();
//     if (!auth.authorized) return { success: false, message: "Unauthorized" };

//     const title = formData.get("title") as string;
//     const summary = formData.get("summary") as string;
//     const fileUrl = formData.get("fileUrl") as string;
//     const type = formData.get("type") as string;
//     const dateStr = formData.get("date") as string;

//     if (!title || !fileUrl) return { success: false, message: "Title and File URL are required" };

//     try {
//         await db.financialReport.create({
//             data: {
//                 title, summary, fileUrl, type,
//                 date: dateStr ? new Date(dateStr) : new Date()
//             }
//         });
//         revalidatePath('/admin/investors');
//         revalidatePath('/investors');
//         return { success: true, message: "Report published" };
//     } catch (error) {
//         return { success: false, message: "Failed to create report" };
//     }
// }

// // --- DELETE ---
// export async function deleteReport(id: string) {
//     const auth = await checkAdminAction();
//     if (!auth.authorized) return { success: false, message: "Unauthorized" };

//     try {
//         await db.financialReport.delete({ where: { id } });
//         revalidatePath('/admin/investors');
//         revalidatePath('/investors');
//         return { success: true, message: "Report deleted" };
//     } catch (error) {
//         return { success: false, message: "Failed to delete" };
//     }
// }