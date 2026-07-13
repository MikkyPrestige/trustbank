import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import PendingWireBanner from "@/components/dashboard/wire/PendingWireBanner";
import WireForm from "@/components/dashboard/wire/WireForm";
import { AlertTriangle, ShieldCheck, Ban } from "lucide-react";
import styles from "../../../../components/dashboard/wire/styles/wire.module.css";
import { getFeatureStatus } from "@/actions/admin/system-status";
import Link from "next/link";

export default async function WirePage({
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
            select: { kycStatus: true, currency: true, wireTransferRestricted: true, wireTransferRestrictedReason: true }
        }),
        db.systemSettings.findUnique({
            where: { key: 'limit_unverified_daily_max' }
        }),
        db.exchangeRate.findMany()
    ]);

    if (!user) return null;

    // Currency Context
    const currency = user.currency || "USD";
    const exchangeRate = currency === "USD"
        ? 1
        : Number(rates.find(r => r.currency === currency)?.rate || 1);

    const isVerified = user.kycStatus === 'VERIFIED';
    const limitAmount = limitSetting ? Number(limitSetting.value) : 10000;

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

    const beneficiaries = await db.beneficiary.findMany({
        where: { userId: session.user.id },
        orderBy: { accountName: 'asc' }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.eyebrow}>Global Payments</span>
                <h1 className={styles.title}>International Wire</h1>
                <p className={styles.subtitle}>Send money worldwide through the secure SWIFT network.</p>

                <div className={isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                    {isVerified ? (
                        <>
                            <ShieldCheck size={16} />
                            <span>Verified Account • Unlimited Access</span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle size={16} />
                            <span>Unverified • Limit ${limitAmount.toLocaleString()}/day</span>
                        </>
                    )}
                </div>
            </div>

            {user.wireTransferRestricted ? (
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}>
                        <Ban size={32} />
                    </div>
                    <h2>Wire Transfers Restricted</h2>
                    <p>{user.wireTransferRestrictedReason || "Your access to international wire transfers has been restricted by an administrator."}</p>
                    <Link href="/dashboard/support" className={styles.verifyBtn}>Contact Support</Link>
                </div>
            ) : !features.wire ? (
                <div className={styles.lockedState}>
                    <div className={styles.lockIconBox}>
                        <Ban size={32} />
                    </div>
                    <h2>Service Unavailable</h2>
                    <p>
                        Wire transfers are currently paused by administration. Please check back later.
                    </p>
                </div>
            ) : (
                <>
                    <PendingWireBanner />
                    <WireForm
                        key={preSelectedId || 'default'}
                        accounts={accounts}
                        beneficiaries={beneficiaries}
                        preSelectedId={preSelectedId}
                        limit={isVerified ? Infinity : limitAmount}
                        currency={currency}
                        rate={exchangeRate}
                    />
                </>
            )}
        </div>
    );
}