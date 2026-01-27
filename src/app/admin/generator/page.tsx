import { db } from "@/lib/db";
import GeneratorForm from "@/components/admin/generator/GeneratorForm";
import styles from "../../../components/admin/generator/generator.module.css";
import { requireAdmin } from "@/lib/auth/admin-auth";
import { Bot } from "lucide-react";

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
                <h1 className={styles.title}>
                    <Bot size={32} className={styles.titleIcon} />
                    Transaction Generator
                </h1>
                <p className={styles.subtitle}>
                    Automatically generate realistic transaction history for any user account.
                </p>
            </div>

            <GeneratorForm accounts={accounts} />
        </div>
    );
}