'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";

// --- CREATE ---
export async function createJob(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const department = formData.get("department") as string;
    const location = formData.get("location") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;

    if (!title || !department || !location) {
        return { success: false, message: "Missing required fields" };
    }

    try {
        await db.jobListing.create({
            data: {
                title, department, location, type, description,
                isActive: true
            }
        });
        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Job posted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create job" };
    }
}

// --- UPDATE ---
export async function updateJob(id: string, formData: FormData) {
   const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const department = formData.get("department") as string;
    const location = formData.get("location") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "on";

    try {
        await db.jobListing.update({
            where: { id },
            data: { title, department, location, type, description, isActive }
        });
        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Job updated" };
    } catch (error) {
        return { success: false, message: "Failed to update job" };
    }
}

// --- DELETE ---
export async function deleteJob(id: string) {
   const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.jobListing.delete({ where: { id } });
        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Job deleted" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}

// --- TOGGLE STATUS (Quick Action) ---
export async function toggleJobStatus(id: string, currentStatus: boolean) {
    const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.jobListing.update({
            where: { id },
            data: { isActive: !currentStatus }
        });
        revalidatePath('/admin/careers');
        revalidatePath('/careers');
        return { success: true, message: "Status updated" };
    } catch (error) {
        return { success: false, message: "Failed to toggle status" };
    }
}