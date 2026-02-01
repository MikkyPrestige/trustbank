'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";

// --- CREATE ---
export async function createJob(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
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

// --- UPDATE ---
export async function updateJob(id: string, formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const department = formData.get("department") as string;
    const location = formData.get("location") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const isActive = formData.get("isActive") === "on";

    if (!title || !department || !location) {
        return { success: false, message: "Title, Department, and Location are required" };
    }

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

// --- DELETE ---
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

// --- TOGGLE STATUS (Quick Action) ---
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

// 'use server';

// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { checkAdminAction } from "@/lib/auth/admin-auth";

// // --- CREATE ---
// export async function createJob(formData: FormData) {
//     const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     const title = formData.get("title") as string;
//     const department = formData.get("department") as string;
//     const location = formData.get("location") as string;
//     const type = formData.get("type") as string;
//     const description = formData.get("description") as string;

//     if (!title || !department || !location) {
//         return { success: false, message: "Missing required fields" };
//     }

//     try {
//         await db.jobListing.create({
//             data: {
//                 title, department, location, type, description,
//                 isActive: true
//             }
//         });
//         revalidatePath('/admin/careers');
//         revalidatePath('/careers');
//         return { success: true, message: "Job posted successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to create job" };
//     }
// }

// // --- UPDATE ---
// export async function updateJob(id: string, formData: FormData) {
//    const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     const title = formData.get("title") as string;
//     const department = formData.get("department") as string;
//     const location = formData.get("location") as string;
//     const type = formData.get("type") as string;
//     const description = formData.get("description") as string;
//     const isActive = formData.get("isActive") === "on";

//     if (!title || !department || !location) {
//         return { success: false, message: "Title, Department, and Location are required" };
//     }

//     try {
//         await db.jobListing.update({
//             where: { id },
//             data: { title, department, location, type, description, isActive }
//         });
//         revalidatePath('/admin/careers');
//         revalidatePath('/careers');
//         return { success: true, message: "Job updated" };
//     } catch (error) {
//         return { success: false, message: "Failed to update job" };
//     }
// }

// // --- DELETE ---
// export async function deleteJob(id: string) {
//    const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     try {
//         await db.jobListing.delete({ where: { id } });
//         revalidatePath('/admin/careers');
//         revalidatePath('/careers');
//         return { success: true, message: "Job deleted" };
//     } catch (error) {
//         return { success: false, message: "Failed to delete" };
//     }
// }

// // --- TOGGLE STATUS (Quick Action) ---
// export async function toggleJobStatus(id: string, currentStatus: boolean) {
//     const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     try {
//         await db.jobListing.update({
//             where: { id },
//             data: { isActive: !currentStatus }
//         });
//         revalidatePath('/admin/careers');
//         revalidatePath('/careers');
//         return { success: true, message: "Status updated" };
//     } catch (error) {
//         return { success: false, message: "Failed to toggle status" };
//     }
// }