import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import WireForm from "./WireForm";
import styles from './wire.module.css';

export default async function WirePage({
    searchParams, // 👈 1. Accept searchParams
}: {
    searchParams: Promise<{ beneficiaryId?: string }>;
}) {
    const session = await auth();
    if (!session) redirect("/login");

    const params = await searchParams;
    const preSelectedId = params?.beneficiaryId;

    const rawAccounts = await db.account.findMany({
        where: { userId: session.user.id },
        orderBy: { isPrimary: 'desc' }
    });

    const accounts = rawAccounts.map(acc => ({
        id: acc.id,
        type: acc.type,
        availableBalance: Number(acc.availableBalance),
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
            </div>

            <WireForm
                accounts={accounts}
                beneficiaries={beneficiaries}
                preSelectedId={preSelectedId}
            />
        </div>
    );
}