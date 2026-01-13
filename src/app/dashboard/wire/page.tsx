import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import WireForm from "./WireForm";
import styles from './wire.module.css';
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default async function WirePage({
    searchParams,
}: {
    searchParams: Promise<{ beneficiaryId?: string }>;
}) {
    const session = await auth();
    if (!session) redirect("/login");

    const params = await searchParams;
    const preSelectedId = params?.beneficiaryId;

    // Fetch User to check KYC Status
    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });
    if (!user) return null;

    const isVerified = user.kycStatus === 'VERIFIED';
    const limitAmount = 2000; // Unverified Limit

    // 👇 FIX: Fetch raw accounts from DB
    const rawAccounts = await db.account.findMany({
        where: { userId: session.user.id },
        orderBy: { isPrimary: 'desc' }
    });

    // 👇 FIX: Map BOTH balances explicitly
    const accounts = rawAccounts.map(acc => ({
        id: acc.id,
        type: acc.type,
        availableBalance: Number(acc.availableBalance), // Spendable
        currentBalance: Number(acc.currentBalance),     // Ledger (Book Balance)
    }));

    const beneficiaries = await db.beneficiary.findMany({
        where: { userId: session.user.id },
        orderBy: { accountName: 'asc' }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>International Wire</h1>
                <p className={styles.subtitle}>Secure SWIFT / IBAN Transfer Network</p>

                <div className={isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                    {isVerified ? (
                        <>
                            <ShieldCheck size={16} />
                            <span>Identity Verified • No Daily Limits</span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle size={16} />
                            <span>Unverified • Limit ${limitAmount.toLocaleString()}/day</span>
                        </>
                    )}
                </div>
            </div>

            <WireForm
                accounts={accounts}
                beneficiaries={beneficiaries}
                preSelectedId={preSelectedId}
            />
        </div>
    );
}