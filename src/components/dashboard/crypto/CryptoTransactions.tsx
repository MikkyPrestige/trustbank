import { db } from "@/lib/db";
import { auth } from "@/auth";
import styles from "./crypto.module.css";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock } from "lucide-react";
import { TransactionType } from "@prisma/client";

export default async function CryptoTransactions({ currency, rate }: { currency: string, rate: number }) {
    const session = await auth();
    if (!session) return null;

    const transactions = await db.ledgerEntry.findMany({
        where: {
            account: { userId: session.user.id },
            type: {
                in: [
                    TransactionType.CRYPTO_BUY,
                    TransactionType.CRYPTO_SELL,
                    TransactionType.CRYPTO_SEND,
                    TransactionType.CRYPTO_RECEIVE
                ]
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 7
    });

    if (transactions.length === 0) return null;

    return (
        <div className={styles.recentTxBox}>
            <div className={styles.txHeader}>
                <Clock size={20}  /> Recent Activity
            </div>

            <div className={styles.txList}>
                {transactions.map((tx) => {
                    const isPositive =
                        tx.type === TransactionType.CRYPTO_SELL ||
                        tx.type === TransactionType.CRYPTO_RECEIVE;

                    let Icon = RefreshCw;
                    if (tx.type === TransactionType.CRYPTO_SEND) Icon = ArrowUpRight;
                    if (tx.type === TransactionType.CRYPTO_RECEIVE) Icon = ArrowDownLeft;

                    const displayAmount = Number(tx.amount) * rate;

                    return (
                        <div key={tx.id} className={styles.txItem}>
                            <div className={styles.txLeft}>
                                <div className={`${styles.txIcon} ${isPositive ? styles.txIconSuccess : styles.txIconDanger}`}>
                                    <Icon size={20} />
                                </div>
                                <div className={styles.txDetails}>
                                    <span className={styles.txTitle}>{tx.description || tx.type.replace('CRYPTO_', '')}</span>
                                    <span className={styles.txDate}>
                                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.txAmount} style={{ color: isPositive ? 'var(--success)' : 'var(--text-main)' }}>
                                {isPositive ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(displayAmount)}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
