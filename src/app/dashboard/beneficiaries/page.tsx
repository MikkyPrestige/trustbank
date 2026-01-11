import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BeneficiaryForm from "./BeneficiaryForm";
import BeneficiaryList from "./BeneficiaryList";
import styles from "./beneficiaries.module.css";

export default async function BeneficiariesPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const beneficiaries = await db.beneficiary.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Beneficiaries</h1>
                <p className={styles.subtitle}>Manage your saved contacts for faster transfers.</p>
            </header>

            <div className={styles.grid}>
                {/* LEFT: LIST (Takes most space) */}
                <div className={styles.listColumn}>
                    <BeneficiaryList beneficiaries={beneficiaries} />
                </div>

                {/* RIGHT: ADD NEW FORM (Sticky Sidebar) */}
                <div className={styles.formColumn}>
                    <div className={styles.formCard}>
                        <h3 className={styles.columnTitle} style={{ marginBottom: '1.5rem' }}>Add New Contact</h3>
                        <BeneficiaryForm />
                    </div>
                </div>
            </div>
        </div>
    );
}