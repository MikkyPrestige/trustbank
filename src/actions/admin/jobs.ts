'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const jobSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  department: z.string().min(1, "Department is required").max(100),
  location: z.string().min(1, "Location is required").max(100),
  type: z.string().max(50).optional(),
  description: z.string().max(5000).optional(),
  isActive: z.boolean().optional(),
});

export async function createJob(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }
const rawData = {
  title: formData.get("title") as string,
  department: formData.get("department") as string,
  location: formData.get("location") as string,
  type: formData.get("type") as string,
  description: formData.get("description") as string,
};

const validated = jobSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
  title: rawTitle,
  department: rawDept,
  location: rawLoc,
  type: rawType,
  description: rawDesc,
} = validated.data;

const title = sanitize(rawTitle);
const department = sanitize(rawDept);
const location = sanitize(rawLoc);
const type = rawType ? sanitize(rawType) : "";
const description = rawDesc ? sanitize(rawDesc) : "";

    try {
        await db.jobListing.create({
            data: {
                title, department, location, type, description,
                isActive: true
            }
        });

        await logAdminAction(
            "CREATE_JOB",
            "NEW_JOB_LISTING",
            {
                title,
                department,
                location,
                action: "Posted Job Listing",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Job posted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create job" };
    }
}

export async function updateJob(id: string, formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

const rawData = {
  title: formData.get("title") as string,
  department: formData.get("department") as string,
  location: formData.get("location") as string,
  type: formData.get("type") as string,
  description: formData.get("description") as string,
  isActive: formData.get("isActive") === "on",
};

const validated = jobSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const {
  title: rawTitle,
  department: rawDept,
  location: rawLoc,
  type: rawType,
  description: rawDesc,
  isActive,
} = validated.data;

const title = sanitize(rawTitle);
const department = sanitize(rawDept);
const location = sanitize(rawLoc);
const type = rawType ? sanitize(rawType) : "";
const description = rawDesc ? sanitize(rawDesc) : "";

    try {
        await db.jobListing.update({
            where: { id },
            data: { title, department, location, type, description, isActive }
        });

        await logAdminAction(
            "UPDATE_JOB",
            id,
            {
                title,
                department,
                action: "Updated Job Details",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Job updated" };
    } catch (error) {
        return { success: false, message: "Failed to update job" };
    }
}

export async function deleteJob(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        const job = await db.jobListing.findUnique({ where: { id } });

        await db.jobListing.delete({ where: { id } });

        await logAdminAction(
            "DELETE_JOB",
            id,
            {
                title: job?.title || "Unknown",
                action: "Deleted Job Listing",
                admin: auth.session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Job deleted" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}

export async function toggleJobStatus(id: string, currentStatus: boolean) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.jobListing.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        await logAdminAction(
            "TOGGLE_JOB_STATUS",
            id,
            {
                action: "Toggled Job Status",
                newStatus: !currentStatus ? "Active" : "Inactive",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Status updated" };
    } catch (error) {
        return { success: false, message: "Failed to toggle status" };
    }
}