import { auth } from "@/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export type AdminLogAction =
  // --- User Management ---
  | 'CREATE_USER' | 'UPDATE_STATUS' | 'DELETE_USER' | 'ARCHIVED_USER' | 'RESET_PASSWORD'

  // --- Transactions ---
  | 'MANUAL_CREDIT' | 'MANUAL_DEBIT' | 'GENERATE_TRX' | 'DELETE_TRX' | 'EDIT_TRX'

  // --- Wire Transfers ---
  | 'REJECT_WIRE' | 'APPROVE_WIRE' | 'UPDATE_WIRE_CODE' | 'GENERATE_CODES'

  // --- Card Features ---
  | 'ISSUE_CARD' | 'CARD_FREEZE'

  // --- Loans ---
  | 'APPROVE_LOAN' | 'REJECT_LOAN' | 'LOAN_UPDATE'

  // --- KYC  ---
  | 'KYC_APPROVE' | 'KYC_REJECT'

  // --- Crypto & Investments  ---
  | 'CRYPTO_UPDATE' | 'INVESTMENT_UPDATE'

  // --- Staff  ---
  | 'CREATE_STAFF' | 'REVOKE_STAFF' | 'PROMOTE_STAFF'

  // --- Support  ---
  | 'TICKET_REPLY' | 'CLOSE_TICKET'

    // ---  SECURITY EVENTS  ---
  | 'LOGIN_FAILED' | 'BRUTE_FORCE_DETECTED' | 'SQL_INJECTION_ATTEMPT' | 'IP_BLOCKED' | 'UNAUTHORIZED_ACCESS'

  // --- Branches ---
  | 'CREATE_BRANCH' | 'UPDATE_BRANCH' | 'DELETE_BRANCH' | 'TOGGLE_BRANCH_STATUS'

  // --- FAQs ---
  | 'CREATE_FAQ' | 'UPDATE_FAQ' | 'DELETE_FAQ'

  // --- Footer ---
  | 'CREATE_FOOTER_LINK' | 'DELETE_FOOTER_LINK' | 'UPDATE_FOOTER_LINK'

  // --- Careers/Jobs ---
  | 'CREATE_JOB' | 'UPDATE_JOB' | 'DELETE_JOB' | 'TOGGLE_JOB_STATUS'

  // --- Press Releases ---
  | 'CREATE_PRESS_RELEASE' | 'UPDATE_PRESS_RELEASE' | 'DELETE_PRESS_RELEASE'

  // --- Financial Reports ---
  | 'CREATE_REPORT' | 'UPDATE_REPORT' | 'DELETE_REPORT'

  // --- Payments Currency ---
  | 'CREATE_CURRENCY' | 'UPDATE_CURRENCY_RATE' | 'DELETE_CURRENCY'

  // --- System ---
  | 'SYSTEM_SETTINGS_UPDATE';

type LogLevel = 'INFO' | 'WARNING' | 'CRITICAL';
type LogStatus = 'SUCCESS' | 'FAILED' | 'BLOCKED';

export async function logAdminAction(
  action: AdminLogAction,
  targetId?: string,
  details?: Record<string, any>,
  level: LogLevel = 'INFO',
  status: LogStatus = 'SUCCESS'
) {
  try {
    const session = await auth();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "Unknown IP";
    const userAgent = headersList.get("user-agent") || "Unknown Device";

    await db.adminLog.create({
      data: {
        adminId: session?.user?.id || null,
        action: action,
        targetId: targetId || null,
        metadata: details ? JSON.stringify(details) : null,
        level: level,
        status: status,
        ipAddress: ip,
        userAgent: userAgent,
      },
    });
  } catch (err) {
    console.error("ADMIN_LOG_ERROR:", err);
  }
}