import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BeneficiaryForm from "@/components/dashboard/beneficiaries/BeneficiaryForm";
import BeneficiaryList from "@/components/dashboard/beneficiaries/BeneficiaryList";
import styles from "../../../../components/dashboard/beneficiaries/beneficiaries.module.css";
import { Users } from "lucide-react";

export default async function BeneficiariesPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    // 1. Fetch raw beneficiaries
    const rawBeneficiaries = await db.beneficiary.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch images for internal users (Smart Enrichment)
    const accountNumbers = rawBeneficiaries.map(b => b.accountNumber);
    const internalAccounts = await db.account.findMany({
        where: { accountNumber: { in: accountNumbers } },
        select: {
            accountNumber: true,
            user: { select: { image: true } }
        }
    });

    // 3. Merge Images
    const beneficiaries = rawBeneficiaries.map(ben => {
        const match = internalAccounts.find(acc => acc.accountNumber === ben.accountNumber);
        return {
            id: ben.id,
            accountName: ben.accountName,
            bankName: ben.bankName,
            accountNumber: ben.accountNumber,
            swiftCode: ben.swiftCode,
            routingNumber: ben.routingNumber,
            image: match?.user.image || null
        };
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerIcon}>
                    <Users size={24} color="#fff" />
                </div>
                <div>
                    <h1 className={styles.title}>Beneficiaries</h1>
                    <p className={styles.subtitle}>Securely manage your saved contacts.</p>
                </div>
            </header>

            <div className={styles.grid}>
                <div className={styles.listColumn}>
                    <BeneficiaryList beneficiaries={beneficiaries} />
                </div>

                <div className={styles.formColumn}>
                    <div className={styles.formCard}>
                        <div className={styles.cardHeader}>
                            <h3>New Contact</h3>
                            <p>Verify bank details before saving.</p>
                        </div>
                        <BeneficiaryForm />
                    </div>
                </div>
            </div>
        </div>
    );
}