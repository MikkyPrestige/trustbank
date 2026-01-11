import { db } from "@/lib/db";

// Define limits for Unverified users
const LIMITS = {
    TRANSFER_MAX: 500, // Max $500 per transfer
    BALANCE_CAP: 2000, // Max $2000 in account
};

export async function checkPermissions(userId: string, action: 'LOAN' | 'CRYPTO' | 'TRANSFER', amount?: number) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { accounts: true }
    });

    if (!user) return { allowed: false, error: "User not found" };

    // If User is Verified, they have NO limits (or higher limits)
    if (user.kycVerified) {
        return { allowed: true };
    }

    // --- RULES FOR UNVERIFIED USERS ---

    // 1. BLOCK SENSITIVE FEATURES
    if (action === 'LOAN') {
        return { allowed: false, error: "KYC Verification required for Loans." };
    }
    if (action === 'CRYPTO') {
        return { allowed: false, error: "Identity verification required for Crypto trading." };
    }

    // 2. LIMIT TRANSFERS
    if (action === 'TRANSFER' && amount) {
        if (amount > LIMITS.TRANSFER_MAX) {
            return { allowed: false, error: `Unverified limit: $${LIMITS.TRANSFER_MAX} per transaction.` };
        }
    }

    // 3. BALANCE CAP (Prevent hoarding money)
    // (Optional logic you can add if needed)

    return { allowed: true };
}