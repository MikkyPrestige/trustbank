'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";

// 1. CREATE USER (Admin Manual Creation)
export async function adminCreateUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return { message: "Unauthorized" };

    const email = formData.get("email") as string;
    const fullName = formData.get("fullName") as string;
    const password = formData.get("password") as string;

    // Check if exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { message: "Email already in use." };

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User & Default Accounts
        await db.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    fullName,
                    passwordHash: hashedPassword,
                    role: "CLIENT",
                    status: "ACTIVE",
                    transactionPin: "0000", // Default PIN
                }
            });

            // Generate fake numbers
            const savingsNum = "10" + Math.floor(Math.random() * 100000000).toString();
            const checkingNum = "20" + Math.floor(Math.random() * 100000000).toString();

            await tx.account.createMany({
                data: [
                    { userId: newUser.id, type: "SAVINGS", accountNumber: savingsNum, accountName: fullName, isPrimary: true },
                    { userId: newUser.id, type: "CHECKING", accountNumber: checkingNum, accountName: fullName, isPrimary: false }
                ]
            });
        });

        revalidatePath("/admin/users");
        return { success: true, message: "User created successfully." };
    } catch (err) {
        return { message: "Failed to create user." };
    }
}

// 2. TOGGLE FREEZE STATUS
export async function toggleUserStatus(userId: string, currentStatus: UserStatus) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return;

    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

    await db.user.update({
        where: { id: userId },
        data: { status: newStatus }
    });
    revalidatePath(`/admin/users/${userId}`);
}

// 3. DELETE USER
export async function deleteUser(userId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return;

    await db.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
}

// 4. FUND / DEDUCT ACCOUNT
export async function adjustUserBalance(accountId: string, amount: number, type: 'CREDIT' | 'DEBIT') {
    const session = await auth();

    // DEBUG LOG
    console.log("Admin Funding Action:", { user: session?.user?.email, role: session?.user?.role });

    if (session?.user?.role !== 'ADMIN') {
        return { message: "Unauthorized access" };
    }

    try {
        await db.$transaction(async (tx) => {
            // A. Update the Account Balance
            await tx.account.update({
                where: { id: accountId },
                data: {
                    availableBalance: type === 'CREDIT'
                        ? { increment: amount }
                        : { decrement: amount }
                }
            });

            // B. Create the Transaction Record
            await tx.ledgerEntry.create({
                data: {
                    accountId: accountId,
                    amount: amount,
                    direction: type,
                    description: type === 'CREDIT' ? "Bank Deposit" : "Bank Correction",
                    status: "COMPLETED",
                    referenceId: "ADM-" + Math.floor(Math.random() * 1000000),
                  type: type === 'CREDIT' ? "DEPOSIT" : "WITHDRAWAL"
                }
            });
        });

        revalidatePath("/admin/users");
        return { success: true, message: "Balance updated successfully." };

    } catch (err) {
        console.error("❌ Funding Error:", err);
        return { message: "Transaction failed. Check terminal for error details." };
    }
}