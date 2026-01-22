import { auth } from "@/auth";
import { db } from "@/lib/db";

// Action List to cover all features
export type AdminLogAction =
  // User Management
   | 'CREATE_USER'
   | 'UPDATE_STATUS'
   | 'DELETE_USER'
   | 'ARCHIVED_USER'
   | 'RESET_PASSWORD'

  // Transactions
  | 'MANUAL_CREDIT'
  | 'MANUAL_DEBIT'
  | 'GENERATE_TRX'
  | 'DELETE_TRX'
  | 'EDIT_TRX'
  // Wire Transactions
  | 'REJECT_WIRE'
  | 'APPROVE_WIRE'

  // Banking Features
  | 'ISSUE_CARD'
  | 'CARD_FREEZE'
  | 'GENERATE_CODES'
  | 'UPDATE_WIRE_CODE'

  // Staff Management
  | 'CREATE_STAFF'
  | 'REVOKE_STAFF'
  | 'PROMOTE_STAFF'

  // Loans
  | 'APPROVE_LOAN'
  | 'REJECT_LOAN'
  | 'LOAN_UPDATE'

  // Support
  | 'TICKET_REPLY'
  | 'CLOSE_TICKET'

  // KYC
  | 'KYC_APPROVE'
  | 'KYC_REJECT'

  // Crypto & Investments
  | 'CRYPTO_UPDATE'
  | 'INVESTMENT_UPDATE'

  // System
  | 'SYSTEM_SETTINGS_UPDATE';

export async function logAdminAction(
    action: AdminLogAction,
    targetId?: string,
    details?: Record<string, any>
) {
  try {
    const session = await auth();

    // If action is performed by system (no session), we can skip or log as 'SYSTEM'
    if (!session?.user?.id) return;

    await db.adminLog.create({
      data: {
        adminId: session.user.id,
        action: action,
        targetId: targetId || null,
        metadata: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    // 🛡️ Fail silently: Logging failure should not crash the app
    console.error("ADMIN_LOG_ERROR:", err);
  }
}