'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const beneficiarySchema = z.object({
    accountName: z.string().min(2, "Account Name is required"),
    accountNumber: z.string().min(10, "Invalid Account Number"),
    bankName: z.string().min(2, "Bank Name is required"),
    swiftCode: z.string().optional(),
});

export async function addBeneficiary(prevState: any, formData: FormData) {
    const session = await auth();
    if (!session) return { message: "Unauthorized" };

    const rawData = {
        accountName: formData.get("accountName"),
        accountNumber: formData.get("accountNumber"),
        bankName: formData.get("bankName"),
        swiftCode: formData.get("swiftCode"),
    };

    const validated = beneficiarySchema.safeParse(rawData);

    if (!validated.success) {
        return { message: "Invalid inputs. Please check fields." };
    }

    try {
        await db.beneficiary.create({
            data: {
                userId: session.user.id,
                accountName: validated.data.accountName,
                accountNumber: validated.data.accountNumber,
                bankName: validated.data.bankName,
                swiftCode: validated.data.swiftCode || null,
            }
        });

        revalidatePath("/dashboard/beneficiaries");
        return { success: true, message: "Beneficiary saved successfully!" };
    } catch (err) {
        return { message: "Failed to save beneficiary." };
    }
}

export async function deleteBeneficiary(id: string) {
   const session = await auth();
    if (!session) return { success: false, message: "Unauthorized" };

    try {
        await db.beneficiary.delete({
            where: {
                id,
                userId: session.user.id,
            },
        });

    revalidatePath('/dashboard/beneficiaries');
        return { success: true, message: "Contact deleted successfully." };
    } catch (error) {
        return { success: false, message: "Could not delete contact." };
    }
}