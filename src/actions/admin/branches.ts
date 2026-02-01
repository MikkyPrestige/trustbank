'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { checkAdminAction } from "@/lib/auth/admin-auth";
import { logAdminAction } from "@/lib/utils/admin-logger";

// --- CREATE ---
export async function createBranch(formData: FormData) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const hours = formData.get("hours") as string;
    const lat = parseFloat(formData.get("lat") as string) || 40.7128;
    const lng = parseFloat(formData.get("lng") as string) || -74.0060;
    const hasAtm = formData.get("hasAtm") === "on";
    const hasDriveThru = formData.get("hasDriveThru") === "on";

    if (!name || !address || !city) {
        return { success: false, message: "Name, Address, and City are required" };
    }

    try {
        await db.branch.create({
            data: { name, address, city, phone, email, hours, lat, lng, hasAtm, hasDriveThru, isActive: true }
        });

        await logAdminAction(
            "CREATE_BRANCH",
            "NEW_BRANCH",
            {
                name,
                city,
                action: "Created Branch Location",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

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

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const hours = formData.get("hours") as string;
    const lat = parseFloat(formData.get("lat") as string);
    const lng = parseFloat(formData.get("lng") as string);
    const isActive = formData.get("isActive") === "on";
    const hasAtm = formData.get("hasAtm") === "on";
    const hasDriveThru = formData.get("hasDriveThru") === "on";

    try {
        await db.branch.update({
            where: { id },
            data: { name, address, city, phone, email, hours, lat, lng, isActive, hasAtm, hasDriveThru }
        });

        await logAdminAction(
            "UPDATE_BRANCH",
            id,
            {
                name,
                action: "Updated Branch Details",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update branch" };
    }
}

// --- DELETE ---
export async function deleteBranch(id: string) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        // Fetch first for log context
        const branch = await db.branch.findUnique({ where: { id } });

        await db.branch.delete({ where: { id } });

        await logAdminAction(
            "DELETE_BRANCH",
            id,
            {
                name: branch?.name || "Unknown",
                action: "Deleted Branch Location",
                admin: auth.session.user.email
            },
            "WARNING",
            "SUCCESS"
        );

        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Branch deleted successfully" };
    } catch (error) {
        return { success: false, message: "Failed to delete branch" };
    }
}

// --- TOGGLE STATUS ---
export async function toggleBranchStatus(id: string, currentStatus: boolean) {
    const auth = await checkAdminAction();

    if (!auth.authorized || !auth.session || !auth.session.user) {
        return { success: false, message: auth.message || "Unauthorized" };
    }

    try {
        await db.branch.update({
            where: { id },
            data: { isActive: !currentStatus }
        });

        await logAdminAction(
            "TOGGLE_BRANCH_STATUS",
            id,
            {
                action: "Toggled Branch Status",
                newStatus: !currentStatus ? "Active" : "Inactive",
                admin: auth.session.user.email
            },
            "INFO",
            "SUCCESS"
        );

        revalidatePath('/admin/branches');
        revalidatePath('/locations');
        return { success: true, message: "Status updated successfully" };
    } catch (error) {
        return { success: false, message: "Failed to update branch status" };
    }
}


// 'use server';

// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { checkAdminAction } from "@/lib/auth/admin-auth";

// // --- CREATE ---
// export async function createBranch(formData: FormData) {
//  const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     const name = formData.get("name") as string;
//     const address = formData.get("address") as string;
//     const city = formData.get("city") as string;
//     const phone = formData.get("phone") as string;
//     const email = formData.get("email") as string;
//     const hours = formData.get("hours") as string;
//     const lat = parseFloat(formData.get("lat") as string) || 40.7128;
//     const lng = parseFloat(formData.get("lng") as string) || -74.0060;
//     const hasAtm = formData.get("hasAtm") === "on";
//     const hasDriveThru = formData.get("hasDriveThru") === "on";

//     if (!name || !address || !city) {
//         return { success: false, message: "Name, Address, and City are required" };
//     }

//     try {
//       await db.branch.create({
//             data: { name, address, city, phone, email, hours, lat, lng, hasAtm, hasDriveThru, isActive: true }
//         });
//         revalidatePath('/admin/branches');
//         revalidatePath('/locations');
//         return { success: true, message: "Branch added successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to create branch" };
//     }
// }

// // --- UPDATE ---
// export async function updateBranch(id: string, formData: FormData) {
//    const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     const name = formData.get("name") as string;
//     const address = formData.get("address") as string;
//     const city = formData.get("city") as string;
//     const phone = formData.get("phone") as string;
//     const email = formData.get("email") as string;
//     const hours = formData.get("hours") as string;
//     const lat = parseFloat(formData.get("lat") as string);
//     const lng = parseFloat(formData.get("lng") as string);
//     const isActive = formData.get("isActive") === "on";
//     const hasAtm = formData.get("hasAtm") === "on";
//     const hasDriveThru = formData.get("hasDriveThru") === "on";

//     try {
//        await db.branch.update({
//             where: { id },
//             data: { name, address, city, phone, email, hours, lat, lng, isActive, hasAtm, hasDriveThru }
//         });
//         revalidatePath('/admin/branches');
//         revalidatePath('/locations');
//         return { success: true, message: "Branch updated successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to update branch" };
//     }
// }

// // --- DELETE ---
// export async function deleteBranch(id: string) {
//     const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     try {
//         await db.branch.delete({ where: { id } });
//         revalidatePath('/admin/branches');
//         revalidatePath('/locations');
//         return { success: true, message: "Branch deleted successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to delete branch" };
//     }
// }

// // --- TOGGLE STATUS ---
// export async function toggleBranchStatus(id: string, currentStatus: boolean) {
//     const auth = await checkAdminAction();

//     if (!auth.authorized) {
//         return { success: false, message: auth.message || "Unauthorized" };
//     }

//     try {
//         await db.branch.update({
//             where: { id },
//             data: { isActive: !currentStatus }
//         });
//         revalidatePath('/admin/branches');
//         revalidatePath('/locations');
//         return { success: true, message: "Status updated successfully" };
//     } catch (error) {
//         return { success: false, message: "Failed to update branch status" };
//     }
// }