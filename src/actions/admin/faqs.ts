'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";

// --- CREATE ---
export async function createFaq(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
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

// --- UPDATE ---
export async function updateFaq(id: string, formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
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

// --- DELETE ---
export async function deleteFaq(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        // Fetch first for log context
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

// 'use server';

// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { checkAdminAction } from "@/lib/auth/admin-auth";

// // --- CREATE ---
// export async function createFaq(formData: FormData) {
//   const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     const question = formData.get("question") as string;
//     const answer = formData.get("answer") as string;
//     const category = formData.get("category") as string;
//     const order = parseInt(formData.get("order") as string) || 0;

//     if (!question || !answer) {
//         return { success: false, message: "Question and Answer are required" };
//     }

//     try {
//         await db.faqItem.create({
//             data: { question, answer, category, order }
//         });
//         revalidatePath('/admin/faqs');
//         revalidatePath('/faqs');
//         return { success: true, message: "FAQ created successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to create FAQ" };
//     }
// }

// // --- UPDATE ---
// export async function updateFaq(id: string, formData: FormData) {
//   const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     const question = formData.get("question") as string;
//     const answer = formData.get("answer") as string;
//     const category = formData.get("category") as string;
//     const order = parseInt(formData.get("order") as string) || 0;

//     if (!question || !answer) {
//         return { success: false, message: "Question and Answer are required" };
//     }

//     try {
//         await db.faqItem.update({
//             where: { id },
//             data: { question, answer, category, order }
//         });
//         revalidatePath('/admin/faqs');
//         revalidatePath('/faqs');
//         return { success: true, message: "FAQ updated successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to update FAQ" };
//     }
// }

// // --- DELETE ---
// export async function deleteFaq(id: string) {
//     const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     try {
//         await db.faqItem.delete({ where: { id } });
//         revalidatePath('/admin/faqs');
//         revalidatePath('/faqs');
//         return { success: true, message: "FAQ deleted successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to delete" };
//     }
// }