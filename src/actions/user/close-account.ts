'use server';

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth/user-guard";
import { checkMaintenanceMode } from "@/lib/security";
import { UserStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function closeAccount(password: string) {
  const { success, message, user } = await getAuthenticatedUser();

    if (await checkMaintenanceMode()) {
        return { success: false, message: "System is currently under maintenance. Please try again later." };
    }

    if (!success || !user) return { message };

    if (!password) {
        return { error: "Current password is required to close account." };
    }

    try {
        // Fetch User & Accounts & Password Hash
        const dbUser = await db.user.findUnique({
            where: { id: user.id },
            include: { accounts: true }
        });

        if (!dbUser) {
            return { error: "User record not found." };
        }

        // Security: Verify Password
        const passwordMatch = await bcrypt.compare(password, dbUser.passwordHash);
        if (!passwordMatch) {
            return { error: "Incorrect password. Cannot verify ownership." };
        }

        // Financial Logic: Check Balances
        const totalBalance = dbUser.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

        // Formatter for the error message
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        if (totalBalance > 0) {
            return {
                error: `Action Failed: You still have ${formatter.format(totalBalance)} in your accounts. You must withdraw all funds to $0.00 before closing.`
            };
        }

        if (totalBalance < 0) {
            return {
                error: `Action Failed: Your account is in overdraft (${formatter.format(totalBalance)}). You must settle this debt before closing.`
            };
        }

        //  ARCHIVE USER (Soft Delete)
        const archivedEmail = `deleted-${Date.now()}_${dbUser.email}`;

        await db.user.update({
            where: { id: user.id },
            data: {
                status: UserStatus.ARCHIVED,
                email: archivedEmail,
                emailVerified: null,
            }
        });

        revalidatePath("/");
        return { success: true };

    } catch (error) {
        console.error("Close Account Error:", error);
        return { error: "System error. Please contact support if this persists." };
    }
}