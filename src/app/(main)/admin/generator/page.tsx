import { db } from "@/lib/db";
import GeneratorForm from "./GeneratorForm";
import styles from "./generator.module.css";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminGeneratorPage() {
    await requireAdmin();

    const accounts = await db.account.findMany({
        include: {
            user: { select: { fullName: true, email: true } }
        },
        orderBy: { user: { fullName: 'asc' } }
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>🤖 Transaction Generator</h1>
                <p className={styles.subtitle}>
                    Generate transaction history for any user.
                </p>
            </div>

            <GeneratorForm accounts={accounts} />
        </div>
    );
}