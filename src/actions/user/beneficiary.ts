'use server';

import { getAuthenticatedUser } from "@/lib/user-guard";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const beneficiarySchema = z.object({
    accountName: z.string().min(2, "Account Name is required"),
    accountNumber: z.string().min(6, "Account Number must be valid"),
    bankName: z.string().min(2, "Bank Name is required"),
    swiftCode: z.string().optional(),
    routingNumber: z.string().optional(),
});

// --- ADD BENEFICIARY ---
export async function addBeneficiary(prevState: any, formData: FormData) {
const { success, message, user } = await getAuthenticatedUser();

    if (!success || !user) {
        return { message };
    }

    const rawData = {
        accountName: formData.get("accountName"),
        accountNumber: formData.get("accountNumber"),
        bankName: formData.get("bankName"),
        swiftCode: formData.get("swiftCode"),
        routingNumber: formData.get("routingNumber"),
    };

    const validated = beneficiarySchema.safeParse(rawData);

    if (!validated.success) {
        return { message: validated.error.issues[0].message };
    }

    try {
        // 1. CREATE BENEFICIARY (Atomic Write)
        await db.beneficiary.create({
            data: {
                userId: user.id,
                accountName: validated.data.accountName,
                accountNumber: validated.data.accountNumber,
                bankName: validated.data.bankName,
                swiftCode: validated.data.swiftCode || null,
                routingNumber: validated.data.routingNumber || null,
            }
        });

        // 2. NOTIFY USER (Side Effect - Moved Outside)
        // We use a separate try/catch so it doesn't break the flow if it fails
        try {
            await db.notification.create({
                data: {
                    userId: user.id,
                    title: "New Beneficiary Added",
                    message: `${validated.data.accountName} (${validated.data.bankName}) has been added to your contacts.`,
                    type: "SUCCESS",
                    link: "/dashboard/beneficiaries",
                    isRead: false
                }
            });
        } catch (notifErr) {
            console.warn("Beneficiary Notification Failed:", notifErr);
        }

    } catch (err: any) {
        console.error("❌ DB ERROR:", err);

        if (err.code === 'P2002') {
            return { message: `This beneficiary is already saved.` };
        }

        return { message: "Database Error: Failed to save." };
    }

    revalidatePath("/dashboard/beneficiaries");
    revalidatePath("/dashboard");

    return { success: true, message: "Beneficiary saved successfully!" };
}

// --- DELETE BENEFICIARY ---
export async function deleteBeneficiary(id: string) {
  const { success, message, user } = await getAuthenticatedUser();

    if (!success || !user) {
        return { message };
    }

    try {
        await db.beneficiary.delete({
            where: {
                id,
                userId: user.id,
            },
        });

    } catch (error) {
        return { success: false, message: "Could not delete contact." };
    }

    revalidatePath('/dashboard/beneficiaries');
    return { success: true, message: "Contact deleted successfully." };
}



// 'use server';

// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { revalidatePath } from "next/cache";
// import { z } from "zod";
// import { UserStatus } from "@prisma/client";

// const beneficiarySchema = z.object({
//     accountName: z.string().min(2, "Account Name is required"),
//     accountNumber: z.string().min(6, "Account Number must be valid"),
//     bankName: z.string().min(2, "Bank Name is required"),
//     swiftCode: z.string().optional(),
//     routingNumber: z.string().optional(),
// });

// // --- ADD BENEFICIARY ---
// export async function addBeneficiary(prevState: any, formData: FormData) {
//     const session = await auth();
//     if (!session) return { success: false, message: "Unauthorized" };

//     const rawData = {
//         accountName: formData.get("accountName"),
//         accountNumber: formData.get("accountNumber"),
//         bankName: formData.get("bankName"),
//         swiftCode: formData.get("swiftCode"),
//         routingNumber: formData.get("routingNumber"),
//     };

//     const validated = beneficiarySchema.safeParse(rawData);

//     if (!validated.success) {
//         return { message: validated.error.issues[0].message };
//     }

//     try {
//         const user = await db.user.findUnique({ where: { id: session.user.id } });

//         if (user?.status === UserStatus.FROZEN) {
//             return { message: "Account Frozen. Cannot add contacts." };
//         }

//         // ✅ Use Transaction: Create Beneficiary + Notification together
//         await db.$transaction(async (tx) => {
//             // 1. Create Beneficiary
//             await tx.beneficiary.create({
//                 data: {
//                     userId: session.user.id,
//                     accountName: validated.data.accountName,
//                     accountNumber: validated.data.accountNumber,
//                     bankName: validated.data.bankName,
//                     swiftCode: validated.data.swiftCode || null,
//                     routingNumber: validated.data.routingNumber || null,
//                 }
//             });

//             // 2. 👇 Create Notification
//             await tx.notification.create({
//                 data: {
//                     userId: session.user.id,
//                     title: "New Beneficiary Added",
//                     message: `${validated.data.accountName} (${validated.data.bankName}) has been added to your contacts.`,
//                     type: "SUCCESS",
//                     link: "/dashboard/beneficiaries",
//                     isRead: false
//                 }
//             });
//         });

//     } catch (err: any) {
//         console.error("❌ DB ERROR:", err);

//         if (err.code === 'P2002') {
//             return { message: `This beneficiary is already saved.` };
//         }

//         return { message: "Database Error: Failed to save." };
//     }

//     revalidatePath("/dashboard/beneficiaries");
//     revalidatePath("/dashboard");

//     return { success: true, message: "Beneficiary saved successfully!" };
// }

// // --- DELETE BENEFICIARY ---
// export async function deleteBeneficiary(id: string) {
//    const session = await auth();
//     if (!session) return { success: false, message: "Unauthorized" };

//     try {
//         await db.beneficiary.delete({
//             where: {
//                 id,
//                 userId: session.user.id,
//             },
//         });

//     } catch (error) {
//         return { success: false, message: "Could not delete contact." };
//     }

//     revalidatePath('/dashboard/beneficiaries');
//     return { success: true, message: "Contact deleted successfully." };
// }