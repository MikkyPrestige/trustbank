import { db } from "@/lib/db";
import { KycStatus, TransactionDirection, TransactionType } from "@prisma/client";

// --- CONFIGURATION ---
const LIMITS = {
    UNVERIFIED_TX_MAX: 2000,      // Max $2,000 per single transaction
    UNVERIFIED_DAILY_MAX: 10000,  // Max $10,000 per day total
    UNVERIFIED_BALANCE_CAP: 100000, // Max $100,000 holding balance
};

// 1. CHECK PERMISSIONS (Sender Limits)
export async function checkPermissions(userId: string, action: 'LOAN' | 'CRYPTO' | 'TRANSFER', amount: number = 0) {
    const user = await db.user.findUnique({
        where: { id: userId },
    });

    if (!user) return { allowed: false, error: "User not found" };

    // ✅ VERIFIED USERS: No Limits
    if (user.kycStatus === KycStatus.VERIFIED) {
        return { allowed: true };
    }

    // --- UNVERIFIED RULES ---

    // A. Feature Blocks
    if (action === 'LOAN') return { allowed: false, error: "KYC Verification required for Loans." };
    if (action === 'CRYPTO') return { allowed: false, error: "Identity verification required for Crypto trading." };

    // B. Transfer Limits
    if (action === 'TRANSFER') {

        // Rule 1: Per Transaction Limit
        if (amount > LIMITS.UNVERIFIED_TX_MAX) {
            return { allowed: false, error: `Unverified Limit: Max $${LIMITS.UNVERIFIED_TX_MAX.toLocaleString()} per transaction.` };
        }

        // Rule 2: Daily Cumulative Limit 🛡️
        // We must calculate how much they have ALREADY spent today.
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayUsage = await db.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
                account: { userId: userId }, // All accounts belonging to this user
                direction: TransactionDirection.DEBIT, // Money leaving
                type: { in: [TransactionType.TRANSFER, TransactionType.WIRE] }, // Only user-initiated transfers
                createdAt: { gte: startOfDay }
            }
        });

        const currentDailyTotal = Number(todayUsage._sum.amount || 0);

        if ((currentDailyTotal + amount) > LIMITS.UNVERIFIED_DAILY_MAX) {
             const remaining = Math.max(0, LIMITS.UNVERIFIED_DAILY_MAX - currentDailyTotal);
             return { allowed: false, error: `Daily Limit ($${LIMITS.UNVERIFIED_DAILY_MAX.toLocaleString()}) Exceeded. You have $${remaining.toLocaleString()} remaining for today.` };
        }
    }

    return { allowed: true };
}

// 2. CHECK INBOUND LIMIT (Balance Cap - For Receivers)
// usage: call this before crediting an unverified user
export async function checkInboundLimit(userId: string, incomingAmount: number) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { accounts: true }
    });

    if (!user) return { allowed: false, error: "User not found" };

    if (user.status === 'SUSPENDED') {
        return {
            allowed: false,
            error: "Transaction Rejected: Beneficiary account is Suspended/Inactive."
        };
    }

    if (user.status === 'FROZEN') return { allowed: true };
    if (user.kycStatus === KycStatus.VERIFIED) return { allowed: true };

    // Calculate Total Holdings
    const totalBalance = user.accounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

    if ((totalBalance + incomingAmount) > LIMITS.UNVERIFIED_BALANCE_CAP) {
        return {
            allowed: false,
            error: `Transfer rejected. Recipient balance cannot exceed $${LIMITS.UNVERIFIED_BALANCE_CAP.toLocaleString()} (Unverified).`
        };
    }

    return { allowed: true };
}

// 3. VERIFY PIN (Standard)
export async function verifyPin(userId: string, pin: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        transactionPin: true,
        failedPinAttempts: true,
        pinLockedUntil: true
      }
    });

    if (!user) return { success: false, error: "User not found" };

    // A. Check Lock
    if (user.pinLockedUntil && new Date() < user.pinLockedUntil) {
       const minutesLeft = Math.ceil((user.pinLockedUntil.getTime() - new Date().getTime()) / 60000);
       return { success: false, error: `PIN locked. Try again in ${minutesLeft} minutes.` };
    }

    // B. Verify
    const isValid = pin === user.transactionPin;

    if (isValid) {
        // Reset counters on success
        if (user.failedPinAttempts > 0 || user.pinLockedUntil) {
            await db.user.update({
                where: { id: userId },
                data: { failedPinAttempts: 0, pinLockedUntil: null }
            });
        }
        return { success: true };
    }

    // C. Handle Failure
    const newCount = user.failedPinAttempts + 1;
    const isLockedNow = newCount >= 5;

    await db.user.update({
        where: { id: userId },
        data: {
            failedPinAttempts: newCount,
            pinLockedUntil: isLockedNow ? new Date(Date.now() + 30 * 60 * 1000) : null
        }
    });

    if (isLockedNow) {
        // Notify Admins
        const admins = await db.user.findMany({
            where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
            select: { id: true }
        });

        if (admins.length > 0) {
            await db.notification.createMany({
                data: admins.map((admin) => ({
                    userId: admin.id,
                    title: "Security Alert: Account Locked",
                    message: `User ${user.fullName || 'User'} has been locked out after 5 failed PIN attempts.`,
                    type: "WARNING",
                    link: `/admin/users/${user.id}`,
                    isRead: false
                }))
            });
        }
        return { success: false, error: "Too many failed attempts. Account locked for 30 minutes." };
    }

    return { success: false, error: `Invalid PIN. ${5 - newCount} attempts remaining.` };

  } catch (error) {
    console.error("PIN Verification Error:", error);
    return { success: false, error: "Security check failed." };
  }
}