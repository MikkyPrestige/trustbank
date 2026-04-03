'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const beneficiarySchema = z.object({
    accountName: z.string().min(2, "Account Name is required"),
    accountNumber: z.string().min(6, "Account Number must be valid"),
    bankName: z.string().min(2, "Bank Name is required"),
    swiftCode: z.string().optional(),
    routingNumber: z.string().optional(),
});

export async function addBeneficiary(prevState: any, formData: FormData) {
const { success, message, user } = await getAuthenticatedUser();

if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

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
        console.error("DB ERROR:", err);

        if (err.code === 'P2002') {
            return { message: `This beneficiary is already saved.` };
        }

        return { message: "Database Error: Failed to save." };
    }

    revalidatePath("/dashboard/beneficiaries");
    revalidatePath("/dashboard");

    return { success: true, message: "Beneficiary saved successfully!" };
}


export async function deleteBeneficiary(id: string) {
  const { success, message, user } = await getAuthenticatedUser();

  if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

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
