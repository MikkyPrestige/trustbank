import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TransferForm from "./TransferForm";
import styles from "./transfer.module.css";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export default async function TransferPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { accounts: true }
    });

    if (!user) return null;

    // 👇 LOGIC FIX: Strictly check for 'VERIFIED' string
    const isVerified = user.kycStatus === 'VERIFIED';
    const limitAmount = 2000;

    const beneficiaries = await db.beneficiary.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    const rawAccounts = await db.account.findMany({
        where: { userId: session.user.id },
        orderBy: { isPrimary: 'desc' }
    });

    const accounts = rawAccounts.map(acc => ({
        ...acc,
        availableBalance: Number(acc.availableBalance),
        currentBalance: Number(acc.currentBalance),
    }));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Local Transfer</h1>
                <p className={styles.subtitle}>Instant transfer to any domestic bank account.</p>

                {/* STATUS BADGE */}
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
            </header>

            <div className={styles.card}>
                <TransferForm accounts={accounts} beneficiaries={beneficiaries} />
            </div>
        </div>
    );
}