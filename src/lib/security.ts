import { db } from "@/lib/db";
import { KycStatus, TransactionDirection, TransactionType } from "@prisma/client";
import { hash, compare } from "bcryptjs";

export async function getSetting(key: string, fallback: number): Promise<number> {
    const setting = await db.systemSettings.findUnique({ where: { key } });
    return setting ? Number(setting.value) : fallback;
}

export async function getBooleanSetting(key: string, fallback: boolean): Promise<boolean> {
    const setting = await db.systemSettings.findUnique({ where: { key } });
    if (!setting) return fallback;
    return setting.value === 'true';
}

/**
 * Checks if an IP is currently blocked due to excessive failures.
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
    const WINDOW_MINUTES = await getSetting('security_lockout_duration', 15);
    const MAX_ATTEMPTS = await getSetting('security_max_attempts', 5);

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    const failureCount = await db.adminLog.count({
        where: {
            ipAddress: ip,
            action: 'LOGIN_FAILED',
            createdAt: { gte: windowStart }
        }
    });

    return failureCount >= MAX_ATTEMPTS;
}

/**
 * Returns details for the UI (e.g. "3 attempts remaining")
 */
export async function getSecurityStatus(ip: string) {
    const WINDOW_MINUTES = await getSetting('security_lockout_duration', 15);
    const MAX_ATTEMPTS = await getSetting('security_max_attempts', 5);

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    const failures = await db.adminLog.findMany({
        where: {
            ipAddress: ip,
            action: 'LOGIN_FAILED',
            createdAt: { gte: windowStart }
        },
        orderBy: { createdAt: 'desc' }
    });

    const failureCount = failures.length;
    const isBlocked = failureCount >= MAX_ATTEMPTS;

    let remainingMinutes = 0;

    if (isBlocked && failures.length > 0) {
        const lastFailureTime = failures[0].createdAt.getTime();
        const unlockTime = lastFailureTime + (WINDOW_MINUTES * 60 * 1000);
        const diff = unlockTime - Date.now();

        // Convert to minutes (round up)
        remainingMinutes = Math.ceil(diff / 60000);
    }

    return {
        isBlocked,
        attemptsRemaining: Math.max(0, MAX_ATTEMPTS - failureCount),
        remainingTime: remainingMinutes > 0 ? remainingMinutes : 0
    };
}

// CHECK Sender Limits
export async function checkPermissions(
    userId: string,
    action: 'TRANSFER_INTERNAL' | 'TRANSFER_WIRE' | 'LOAN_APPLY' | 'LOAN_REPAY' | 'CRYPTO_TRADE' | 'CRYPTO_TRANSFER' | 'WALLET_GEN',
    amount: number = 0
) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return { allowed: false, error: "User not found" };

    // 1. FETCH ALL FLAGS
    const allowTransfer = await getBooleanSetting('feature_transfer_enabled', true);
    const allowWire = await getBooleanSetting('feature_wire_enabled', true);
    const allowLoanApply = await getBooleanSetting('feature_loan_apply_enabled', true);
    const allowLoanRepay = await getBooleanSetting('feature_loan_repay_enabled', true);
    const allowTrade = await getBooleanSetting('feature_crypto_enabled', true);
    const allowWallet = await getBooleanSetting('feature_wallet_gen_enabled', true);

    // CHECK FEATURE FLAGS (Before KYC)
    if (action === 'TRANSFER_INTERNAL' && !allowTransfer) return { allowed: false, error: "Internal transfers are temporarily disabled." };
    if (action === 'TRANSFER_WIRE' && !allowWire) return { allowed: false, error: "Wire transfers are temporarily paused." };
    if (action === 'LOAN_APPLY' && !allowLoanApply) return { allowed: false, error: "New loan applications are temporarily paused." };
    if (action === 'LOAN_REPAY' && !allowLoanRepay) return { allowed: false, error: "Loan repayments are currently unavailable." };
    if (action === 'CRYPTO_TRADE' && !allowTrade) return { allowed: false, error: "Crypto trading is paused." };
    if (action === 'CRYPTO_TRANSFER' && !allowTransfer) return { allowed: false, error: "Crypto transfers are temporarily disabled." };
    if (action === 'WALLET_GEN' && !allowWallet) return { allowed: false, error: "Wallet generation is paused." };

    //  KYC BYPASS (Verified users skip limits, but NOT feature flags)
    if (user.kycStatus === KycStatus.VERIFIED) return { allowed: true };

    // UNVERIFIED RESTRICTIONS
    if (action === 'LOAN_APPLY') return { allowed: false, error: "KYC required for Loans." };
    if (action === 'CRYPTO_TRADE') return { allowed: false, error: "KYC required for Trading." };
    if (action === 'CRYPTO_TRANSFER') return { allowed: false, error: "KYC required for Transfers." };
    if (action === 'WALLET_GEN') return { allowed: false, error: "KYC required." };

    // WIRE & INTERNAL TRANSFER LIMITS
   if (action === 'TRANSFER_INTERNAL' || action === 'TRANSFER_WIRE') {
        const maxTx = await getSetting('limit_unverified_tx_max', 2000);
        const maxDaily = await getSetting('limit_unverified_daily_max', 10000);

        if (amount > maxTx) return { allowed: false, error: `Unverified Limit: Max $${maxTx.toLocaleString()} per transaction.` };

        // Check Daily Usage (Summing both types)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayUsage = await db.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
                account: { userId: userId },
                direction: TransactionDirection.DEBIT,
                type: { in: [TransactionType.TRANSFER, TransactionType.WIRE] },
                createdAt: { gte: startOfDay }
            }
        });

        const currentDailyTotal = Number(todayUsage._sum.amount || 0);
        if ((currentDailyTotal + amount) > maxDaily) {
             const remaining = Math.max(0, maxDaily - currentDailyTotal);
             return { allowed: false, error: `Daily Limit Exceeded. Remaining: $${remaining.toLocaleString()}` };
        }
    }

    return { allowed: true };
}

// 2. CHECK INBOUND LIMIT (Balance Cap)
export async function checkInboundLimit(userId: string, incomingAmount: number) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { accounts: true }
    });

    if (!user) return { allowed: false, error: "User not found" };

    if (user.status === 'SUSPENDED') {
        return { allowed: false, error: "Transaction Rejected: Beneficiary account is Suspended/Inactive." };
    }

    if (user.status === 'FROZEN') return { allowed: true };
    if (user.kycStatus === KycStatus.VERIFIED) return { allowed: true };

    const balanceCap = await getSetting('limit_unverified_balance_cap', 100000);
    const totalBalance = user.accounts.reduce((sum, acc) => sum + Number(acc.currentBalance), 0);

    if ((totalBalance + incomingAmount) > balanceCap) {
        return {
            allowed: false,
            error: `Transfer rejected. Recipient balance cannot exceed $${balanceCap.toLocaleString()} (Unverified).`
        };
    }

    return { allowed: true };
}

export async function hashPin(pin: string): Promise<string> {
    return await hash(pin, 10);
}

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

    // CHECK LOCK STATUS
    if (user.pinLockedUntil && new Date() < user.pinLockedUntil) {
       const minutesLeft = Math.ceil((user.pinLockedUntil.getTime() - new Date().getTime()) / 60000);
       return { success: false, error: `PIN locked. Try again in ${minutesLeft} minutes.` };
    }

    // VERIFY PIN (Smart Check)
    let isValid = false;
    const storedPin = user.transactionPin || "";

    const isHashed = storedPin.startsWith('$2');

    if (isHashed) {
        isValid = await compare(pin, storedPin);
    } else {
        isValid = (pin === storedPin);

        // AUTO-MIGRATE: If valid plain text, upgrade to hash immediately
        if (isValid) {
            const secureHash = await hash(pin, 10);
            await db.user.update({
                where: { id: userId },
                data: { transactionPin: secureHash }
            });
            console.log(`[Security] Migrated PIN for user ${userId}`);
        }
    }

    if (isValid) {
        if (user.failedPinAttempts > 0 || user.pinLockedUntil) {
            await db.user.update({
                where: { id: userId },
                data: { failedPinAttempts: 0, pinLockedUntil: null }
            });
        }
        return { success: true };
    }

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
        await db.notification.create({
            data: {
                userId: user.id,
                title: "Security Alert: Account Locked",
                message: "Your account has been temporarily locked due to 5 failed PIN attempts.",
                type: "WARNING",
                link: "/settings/security",
                isRead: false
            }
        });

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
        return { success: false, error: "Too many failed attempts. Account locked for 15 minutes." };
    }

    return { success: false, error: `Invalid PIN. ${5 - newCount} attempts remaining.` };

  } catch (error) {
    console.error("PIN Verification Error:", error);
    return { success: false, error: "Security check failed." };
  }
}

// SYSTEM STATUS
export async function checkMaintenanceMode(): Promise<boolean> {
    return await getBooleanSetting('maintenance_mode', false);
}
