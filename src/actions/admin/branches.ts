'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/admin-auth";

// --- CREATE ---
export async function createBranch(formData: FormData) {
 const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    if (!name || !address || !city) {
        return { success: false, message: "Name, Address, and City are required" };
    }

    try {
        await db.branch.create({
            data: { name, address, city, phone, email, isActive: true }
        });
        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch added successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create branch" };
    }
}

// --- UPDATE ---
export async function updateBranch(id: string, formData: FormData) {
   const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const isActive = formData.get("isActive") === "on";

    try {
        await db.branch.update({
            where: { id },
            data: { name, address, city, phone, email, isActive }
        });
        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch updated" };
    } catch (error) {
        return { success: false, message: "Failed to update branch" };
    }
}

// --- DELETE ---
export async function deleteBranch(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.branch.delete({ where: { id } });
        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch deleted" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}

// --- TOGGLE STATUS ---
export async function toggleBranchStatus(id: string, currentStatus: boolean) {
    const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.branch.update({
            where: { id },
            data: { isActive: !currentStatus }
        });
        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Status updated" };
    } catch (error) {
        return { success: false, message: "Failed to update status" };
    }
}