import { db } from "@/lib/db";
import WireRow from "@/components/admin/wires/WireRow";
import Link from "next/link";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin-auth";
import styles from "../../../components/admin/wires/wires.module.css";
import { UserStatus } from "@prisma/client";

export default async function AdminWiresPage() {
    await requireAdmin();

    const [wires, rates] = await Promise.all([
        db.wireTransfer.findMany({
            where: {
                user: {
                    status: { not: UserStatus.ARCHIVED }
                }
            },
            include: {
                user: {
                    select: { fullName: true, email: true, currency: true, status: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }),
        db.exchangeRate.findMany()
    ]);

    const rateMap = new Map(rates.map(r => [r.currency, Number(r.rate)]));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Wire Approvals</h1>
                    <p className={styles.subtitle}>Manage international transfers and codes</p>
                </div>

                {/* <div className={styles.headerActions}>
                    <Link href="/admin" className={styles.backBtn}>
                        <ArrowLeft size={18} /> Dashboard
                    </Link>
                </div> */}
            </header>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date / Time</th>
                            <th>User Details</th>
                            <th>Beneficiary Info</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {wires.map((wire) => {
                            // @ts-ignore
                            const currency = wire.user.currency || "USD";
                            const rate = currency === "USD" ? 1 : (rateMap.get(currency) || 1);

                            return (
                                <WireRow
                                    key={wire.id}
                                    // @ts-ignore
                                    wire={wire}
                                    currency={currency}
                                    rate={rate}
                                />
                            )
                        })}
                    </tbody>
                </table>

                {wires.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <FolderOpen size={48} strokeWidth={1} />
                        </div>
                        <h3>No Wires Found</h3>
                        <p>There are no pending or past wire transfers in the system.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
