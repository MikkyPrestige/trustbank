'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";

// --- CREATE ---
export async function createFaq(formData: FormData) {
  const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const category = formData.get("category") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    if (!question || !answer) {
        return { success: false, message: "Question and Answer are required" };
    }

    try {
        await db.faqItem.create({
            data: { question, answer, category, order }
        });
        revalidatePath('/admin/faqs');
        revalidatePath('/faqs');
        return { success: true, message: "FAQ created successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create FAQ" };
    }
}

// --- UPDATE ---
export async function updateFaq(id: string, formData: FormData) {
  const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const question = formData.get("question") as string;
    const answer = formData.get("answer") as string;
    const category = formData.get("category") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    try {
        await db.faqItem.update({
            where: { id },
            data: { question, answer, category, order }
        });
        revalidatePath('/admin/faqs');
        revalidatePath('/faqs');
        return { success: true, message: "FAQ updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update FAQ" };
    }
}

// --- DELETE ---
export async function deleteFaq(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.faqItem.delete({ where: { id } });
        revalidatePath('/admin/faqs');
        revalidatePath('/faqs');
        return { success: true, message: "FAQ deleted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}