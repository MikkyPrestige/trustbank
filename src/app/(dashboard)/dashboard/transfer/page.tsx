import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import TransferForm from "@/components/dashboard/transfer/TransferForm";
import { AlertTriangle, ShieldCheck, Ban } from "lucide-react";
import { KycStatus } from "@prisma/client";
import styles from "../../../../components/dashboard/transfer/transfer.module.css";
import { getFeatureStatus } from "@/actions/admin/system-status";

export default async function TransferPage({
    searchParams,
}: {
    searchParams: Promise<{ beneficiaryId?: string }>;
}) {
    const session = await auth();
    const features = await getFeatureStatus();

    if (!session) redirect("/login");

    const params = await searchParams;
    const preSelectedId = params?.beneficiaryId;

    const [user, limitSetting, rates] = await Promise.all([
        db.user.findUnique({
            where: { id: session.user.id },
            include: { accounts: true }
        }),
        db.systemSettings.findUnique({
            where: { key: 'limit_unverified_daily_max' }
        }),
        db.exchangeRate.findMany()
    ]);

    if (!user) return null;

    const currency = user.currency || "USD";
    const exchangeRate = currency === "USD"
        ? 1
        : Number(rates.find(r => r.currency === currency)?.rate || 1);

    const isVerified = user.kycStatus === KycStatus.VERIFIED;
    const dbLimit = limitSetting ? Number(limitSetting.value) : 10000;
    const limitAmount = isVerified ? Infinity : dbLimit;

    const beneficiaries = await db.beneficiary.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    const rawAccounts = await db.account.findMany({
        where: { userId: session.user.id },
        orderBy: { isPrimary: 'desc' }
    });

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
                            <span>Unverified • Limit ${dbLimit.toLocaleString()}/day</span>
                        </>
                    )}
                </div>
            </header>

            {!features.transfers ? (
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}>
                        <Ban size={32} />
                    </div>
                    <h2>Transfers Paused</h2>
                    <p>
                        Domestic transfers are currently disabled by administration. Please check back later.
                    </p>
                </div>
            ) : (
                <div className={styles.card}>
                    <TransferForm
                        key={preSelectedId || 'default'}
                        accounts={accounts}
                        beneficiaries={beneficiaries}
                        preSelectedId={preSelectedId}
                        limit={limitAmount}
                        currency={currency}
                        rate={exchangeRate}
                    />
                </div>
            )}
        </div>
    );
}