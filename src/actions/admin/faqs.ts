'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const faqSchema = z.object({
  question: z.string().min(1, "Question is required").max(300),
  answer: z.string().min(1, "Answer is required").max(5000),
  category: z.string().max(50).optional(),
  order: z.coerce.number().int().nonnegative().optional(),
});

export async function createFaq(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

const rawData = {
  question: formData.get("question") as string,
  answer: formData.get("answer") as string,
  category: formData.get("category") as string,
  order: formData.get("order") as string,
};

const validated = faqSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { question: rawQuestion, answer: rawAnswer, category: rawCategory, order } = validated.data;

const question = sanitize(rawQuestion);
const answer = sanitize(rawAnswer);
const category = rawCategory ? sanitize(rawCategory) : "";

    try {
        await db.faqItem.create({
            data: { question, answer, category, order }
        });

        await logAdminAction(
            "CREATE_FAQ",
            "NEW_FAQ",
            {
                question,
                category,
                action: "Created FAQ Item",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/faqs');
        revalidatePath('/faqs');
        return { success: true, message: "FAQ created successfully" };
    } catch (error) {
        return { success: false, message: "Failed to create FAQ" };
    }
}

export async function updateFaq(id: string, formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

const rawData = {
  question: formData.get("question") as string,
  answer: formData.get("answer") as string,
  category: formData.get("category") as string,
  order: formData.get("order") as string,
};

const validated = faqSchema.safeParse(rawData);
if (!validated.success) {
  return { success: false, message: validated.error.issues[0].message };
}

const { question: rawQuestion, answer: rawAnswer, category: rawCategory, order } = validated.data;

const question = sanitize(rawQuestion);
const answer = sanitize(rawAnswer);
const category = rawCategory ? sanitize(rawCategory) : "";

if (!id) return { success: false, message: "Missing FAQ ID" };

    try {
        await db.faqItem.update({
            where: { id },
            data: { question, answer, category, order }
        });

        await logAdminAction(
            "UPDATE_FAQ",
            id,
            {
                question,
                action: "Updated FAQ Item",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/faqs');
        revalidatePath('/faqs');
        return { success: true, message: "FAQ updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update FAQ" };
    }
}

export async function deleteFaq(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        const faq = await db.faqItem.findUnique({ where: { id } });

        await db.faqItem.delete({ where: { id } });

        await logAdminAction(
            "DELETE_FAQ",
            id,
            {
                question: faq?.question || "Unknown",
                action: "Deleted FAQ Item",
                admin: auth.session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/admin/faqs');
        revalidatePath('/faqs');
        return { success: true, message: "FAQ deleted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to delete" };
    }
}