'use server';

import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { db } from "@/lib/db";
import { checkMaintenanceMode } from "@/lib/security";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const sanitize = (str: string) => str.replace(/<[^>]*>/g, '');

const beneficiarySchema = z.object({
    accountName: z.string().min(2, "Account Name is required").max(100),
    accountNumber: z.string().min(6, "Account Number must be valid").max(30),
    bankName: z.string().min(2, "Bank Name is required").max(100),
    swiftCode: z.string().max(11).optional(),
    routingNumber: z.string().max(20).optional(),
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

    const cleanData = {
    ...validated.data,
    accountName: sanitize(validated.data.accountName),
    bankName: sanitize(validated.data.bankName),
};

    try {
        await db.beneficiary.create({
            data: {
                userId: user.id,
                accountName: cleanData.accountName,
                accountNumber: cleanData.accountNumber,
                bankName: cleanData.bankName,
                swiftCode: cleanData.swiftCode || null,
                routingNumber: cleanData.routingNumber || null,
            }
        });

        try {
            await db.notification.create({
                data: {
                    userId: user.id,
                    title: "New Beneficiary Added",
                    message: `${cleanData.accountName} (${cleanData.bankName}) has been added to your contacts.`,
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

    const idSchema = z.string().min(1, "Beneficiary ID is required");
const parsedId = idSchema.safeParse(id);
if (!parsedId.success) {
    return { success: false, message: parsedId.error.issues[0].message };
}
const safeId = parsedId.data;

    try {
        await db.beneficiary.delete({
            where: {
                id: safeId,
                userId: user.id,
            },
        });

    } catch (error) {
        return { success: false, message: "Could not delete contact." };
    }

    revalidatePath('/dashboard/beneficiaries');
    return { success: true, message: "Contact deleted successfully." };
}
