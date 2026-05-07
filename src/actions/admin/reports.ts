'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const reportSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  summary: z.string().max(2000).optional(),
  fileUrl: z.string().url("Invalid URL").max(500),
  type: z.string().max(50).optional(),
  date: z.string().optional(),
});

export async function createReport(formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

const rawData = {
  title: formData.get("title") as string,
  summary: formData.get("summary") as string,
  fileUrl: formData.get("fileUrl") as string,
  type: formData.get("type") as string,
  date: formData.get("date") as string,
};

const validated = reportSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
    title: rawTitle,
    summary: rawSummary,
    fileUrl,
    type: rawType,
    date: dateStr
} = validated.data;

const title = sanitize(rawTitle);
const summary = rawSummary ? sanitize(rawSummary) : undefined;
const type = rawType ? sanitize(rawType) : undefined;

    try {
        await db.financialReport.create({
           data: {
                title,
                summary: summary ?? "",
                fileUrl,
                type,
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

export async function updateReport(id: string, formData: FormData) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

 const rawData = {
  title: formData.get("title") as string,
  summary: formData.get("summary") as string,
  fileUrl: formData.get("fileUrl") as string,
  type: formData.get("type") as string,
  date: formData.get("date") as string,
};

const validated = reportSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
    title: rawTitle,
    summary: rawSummary,
    fileUrl,
    type: rawType,
    date: dateStr
} = validated.data;

const title = sanitize(rawTitle);
const summary = rawSummary ? sanitize(rawSummary) : undefined;
const type = rawType ? sanitize(rawType) : undefined;

    try {
        const updatedReport = await db.financialReport.update({
            where: { id },
            data: {
                title,
                summary,
                fileUrl,
                type,
                date: dateStr ? new Date(dateStr) : undefined
            }
        });

        await logAdminAction(
            "UPDATE_REPORT",
            id,
            {
                title: updatedReport.title,
                type: updatedReport.type,
                admin: session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/investors');
        revalidatePath('/investors');

        return { success: true, message: "Report updated successfully" };
    } catch (error) {
        console.error("Update Report Error:", error);
        return { success: false, message: "Failed to update report" };
    }
}

export async function deleteReport(id: string) {
    const { authorized, session } = await checkAdminAction();
    if (!authorized || !session || !session.user) return { success: false, message: "Unauthorized" };

    try {
        const report = await db.financialReport.findUnique({ where: { id } });

        if (!report) return { success: false, message: "Report not found" };

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