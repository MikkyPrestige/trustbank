import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import PendingWireBanner from "@/components/dashboard/wire/PendingWireBanner";
import WireForm from "@/components/dashboard/wire/WireForm";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import styles from "../../../../components/dashboard/wire/styles/wire.module.css"

export default async function WirePage({
    searchParams,
}: {
    searchParams: Promise<{ beneficiaryId?: string }>;
}) {
    const session = await auth();
    if (!session) redirect("/login");

    const params = await searchParams;
    const preSelectedId = params?.beneficiaryId;

    // 1. Fetch User & Dynamic Limit Setting
    const [user, limitSetting] = await Promise.all([
        db.user.findUnique({
            where: { id: session.user.id },
            select: { kycStatus: true }
        }),
        db.systemSettings.findUnique({
            where: { key: 'limit_unverified_daily_max' }
        })
    ]);

    if (!user) return null;

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
                <h1 className={styles.title}>International Wire Transfer</h1>
                <p className={styles.subtitle}>Secure SWIFT / IBAN Transfer Network</p>

                {/* DYNAMIC LIMIT BADGE */}
                <div className={isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
                    {isVerified ? (
                        <>
                            <ShieldCheck size={16} />
                            <span>Identity Verified • Unlimited Access Unlocked</span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle size={16} />
                            <span>Unverified • Limit ${limitAmount.toLocaleString()}/day</span>
                        </>
                    )}
                </div>
            </div>

            <PendingWireBanner />

            <WireForm
                key={preSelectedId || 'default'}
                accounts={accounts}
                beneficiaries={beneficiaries}
                preSelectedId={preSelectedId}
                limit={isVerified ? Infinity : limitAmount}
            />
        </div>
    );
}


// import { auth } from "@/auth";
// import { db } from "@/lib/db";
// import { redirect } from "next/navigation";
// import PendingWireBanner from "@/components/dashboard/wire/PendingWireBanner";
// import WireForm from "@/components/dashboard/wire/WireForm";
// import { AlertTriangle, ShieldCheck } from "lucide-react";
// import styles from "../../../../components/dashboard/wire/styles/wire.module.css"

// export default async function WirePage({
//     searchParams,
// }: {
//     searchParams: Promise<{ beneficiaryId?: string }>;
// }) {
//     const session = await auth();
//     if (!session) redirect("/login");

//     const params = await searchParams;
//     const preSelectedId = params?.beneficiaryId;

//     const user = await db.user.findUnique({
//         where: { id: session.user.id }
//     });
//     if (!user) return null;

//     const isVerified = user.kycStatus === 'VERIFIED';
//     const limitAmount = 2000;

//     const rawAccounts = await db.account.findMany({
//         where: { userId: session.user.id },
//         orderBy: { isPrimary: 'desc' }
//     });

//     const accounts = rawAccounts.map(acc => ({
//         id: acc.id,
//         type: acc.type,
//         availableBalance: Number(acc.availableBalance),
//         currentBalance: Number(acc.currentBalance),
//     }));

//     const beneficiaries = await db.beneficiary.findMany({
//         where: { userId: session.user.id },
//         orderBy: { accountName: 'asc' }
//     });

//     return (
//         <div className={styles.container}>
//             <div className={styles.header}>
//                 <h1 className={styles.title}>International Wire Transfer</h1>
//                 <p className={styles.subtitle}>Secure SWIFT / IBAN Transfer Network</p>

//                 <div className={isVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
//                     {isVerified ? (
//                         <>
//                             <ShieldCheck size={16} />
//                             <span>Identity Verified • Global Access Unlocked</span>
//                         </>
//                     ) : (
//                         <>
//                             <AlertTriangle size={16} />
//                             <span>Unverified • Limit ${limitAmount.toLocaleString()}/day</span>
//                         </>
//                     )}
//                 </div>
//             </div>
//             <PendingWireBanner />

//             <WireForm
//                 key={preSelectedId || 'default'}
//                 accounts={accounts}
//                 beneficiaries={beneficiaries}
//                 preSelectedId={preSelectedId}
//             />
//         </div>
//     );
// }