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
    if (user.kycStatus) {
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


export async function verifyPin(userId: string, pin: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        transactionPin: true,
        failedPinAttempts: true,
        pinLockedUntil: true
      }
    });

    if (!user) return { success: false, error: "User not found" };

    // 1. CHECK LOCK STATUS
    // If we have a lock date and it's in the future, BLOCK THEM.
    if (user.pinLockedUntil && new Date() < user.pinLockedUntil) {
       const minutesLeft = Math.ceil((user.pinLockedUntil.getTime() - new Date().getTime()) / 60000);
       return { success: false, error: `PIN locked. Try again in ${minutesLeft} minutes.` };
    }

    // 2. CHECK ATTEMPTS (Limit: 5)
    if (user.failedPinAttempts >= 5) {
        // Optional: Set a lock time (e.g., 30 minutes) if not already set
        if (!user.pinLockedUntil) {
             await db.user.update({
                where: { id: userId },
                data: { pinLockedUntil: new Date(Date.now() + 30 * 60 * 1000) } // 30 mins from now
             });
        }
        return { success: false, error: "Account locked due to too many failed PIN attempts." };
    }

    // 3. VERIFY PIN
    // Note: If you store PINs as plain text (e.g. "1234"), use: pin === user.transactionPin
    // If you hash them, use bcrypt.compare
    const isValid = pin === user.transactionPin;

    if (!isValid) {
      // ❌ WRONG PIN
      const newCount = user.failedPinAttempts + 1;

      // Update DB
      await db.user.update({
        where: { id: userId },
        data: { failedPinAttempts: newCount }
      });

      const remaining = 5 - newCount;
      if (remaining <= 0) {
          return { success: false, error: "PIN Limit Reached. Account Locked." };
      }

      return { success: false, error: `Invalid PIN. ${remaining} attempts remaining.` };
    }

    // ✅ SUCCESS: Reset counter to 0
    if (user.failedPinAttempts > 0 || user.pinLockedUntil) {
      await db.user.update({
        where: { id: userId },
        data: { failedPinAttempts: 0, pinLockedUntil: null }
      });
    }

    return { success: true };

  } catch (error) {
    console.error("PIN Verification Error:", error);
    return { success: false, error: "Security check failed." };
  }
}