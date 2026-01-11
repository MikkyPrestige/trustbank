import { TransactionType, TransactionDirection, TransactionStatus } from "@prisma/client";
import styles from './TransactionList.module.css';

interface Transaction {
    id: string;
    type: TransactionType;
    direction: TransactionDirection;
    amount: number;
    status: TransactionStatus;
    createdAt: Date;
    description: string | null;
}

export default function TransactionList({ transactions }: { transactions: Transaction[] }) {
    if (transactions.length === 0) {
        return (
            <div className={styles.empty}>
                No transactions found. Start by making a deposit!
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {transactions.map((tx) => {
                const isCredit = tx.direction === 'CREDIT';
                const formattedAmount = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(tx.amount);

                return (
                    <div key={tx.id} className={styles.item}>
                        <div className={styles.icon} data-type={tx.type}>
                            {tx.type === 'DEPOSIT' ? '↓' : '→'}
                        </div>

                        <div className={styles.details}>
                            <span className={styles.description}>
                                {tx.description || tx.type}
                            </span>
                            <span className={styles.date}>
                                {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div className={`${styles.amount} ${isCredit ? styles.credit : styles.debit}`}>
                            {isCredit ? '+' : '-'}{formattedAmount}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}