import { db } from "@/lib/db";
import WireRow from "./WireRow";
import styles from "./wires.module.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminWiresPage() {
    await requireAdmin();

    const wires = await db.wireTransfer.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Wire Approvals</h1>
                    <p className={styles.subtitle}>Manage international transfers and COT/IMF codes.</p>
                </div>
                <Link href="/admin" className={styles.backBtn}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Beneficiary</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wires.map((wire) => (
                            <WireRow key={wire.id} wire={wire} />
                        ))}
                    </tbody>
                </table>

                {wires.length === 0 && (
                    <div className={styles.emptyState}>
                        No wire transfers found.
                    </div>
                )}
            </div>
        </div>
    );
}