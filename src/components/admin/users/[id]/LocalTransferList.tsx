import { db } from "@/lib/db";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import styles from "./users.module.css";

export default async function LocalTransferList({ userId }: { userId: string }) {
    const transfers = await db.ledgerEntry.findMany({
        where: {
            account: { userId: userId },
            type: "TRANSFER"
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { account: true }
    });

    if (transfers.length === 0) {
        return <div className={styles.emptySmall}>No local transfers found.</div>;
    }

    return (
        <div className={styles.listContainer}>
            {transfers.map((tx) => {
                const isCredit = tx.direction === 'CREDIT';
                return (
                    <div key={tx.id} className={styles.listItem}>
                        <div className={styles.flexCenterGap}>
                            <div className={`${styles.iconBox} ${isCredit ? styles.iconGreen : styles.iconRed}`}>
                                {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                                    {isCredit ? "Received" : "Sent"}
                                </div>
                                <div className={styles.tiny}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className={isCredit ? styles.textGreen : styles.textRed} style={{ fontWeight: 600 }}>
                                {isCredit ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(tx.amount))}
                            </div>
                            <div className={styles.tiny}>{tx.status}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}