import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TransferForm from "@/components/dashboard/transfer/TransferForm";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { KycStatus } from "@prisma/client";
import styles from "../../../../components/dashboard/transfer/transfer.module.css"

export default async function TransferPage({
    searchParams,
}: {
    searchParams: Promise<{ beneficiaryId?: string }>;
}) {
    const session = await auth();
    if (!session) redirect("/login");

    const params = await searchParams;
    const preSelectedId = params?.beneficiaryId;

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { accounts: true }
    });

    if (!user) return null;

    const isVerified = user.kycStatus === KycStatus.VERIFIED;
    const limitAmount = 10000;

    const beneficiaries = await db.beneficiary.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    const rawAccounts = await db.account.findMany({
        where: { userId: session.user.id },
        orderBy: { isPrimary: 'desc' }
    });

    // Serialize Decimals
    const accounts = rawAccounts.map(acc => ({
        id: acc.id,
        type: acc.type,
        availableBalance: Number(acc.availableBalance),
        currentBalance: Number(acc.currentBalance),
    }));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Local Transfer</h1>
                <p className={styles.subtitle}>Instant transfer to any domestic bank account.</p>

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
                <TransferForm
                    key={preSelectedId || 'default'}
                    accounts={accounts}
                    beneficiaries={beneficiaries}
                    preSelectedId={preSelectedId}
                />
            </div>
        </div>
    );
}