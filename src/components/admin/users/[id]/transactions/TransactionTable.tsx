'use client';

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteTransaction, updateTransaction } from "@/actions/admin/transaction";
import { Pencil, Trash2, X, Calendar, FileText, DollarSign, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./transactions.module.css";
import { LedgerEntry, Account } from "@prisma/client";

type TransactionWithAccount = LedgerEntry & { account: Account };

interface TransactionTableProps {
    transactions: TransactionWithAccount[];
    currency: string;
    rate: number;
}

export default function TransactionTable({ transactions, currency, rate }: TransactionTableProps) {
    const router = useRouter();
    const [editingTrx, setEditingTrx] = useState<TransactionWithAccount | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("WARNING: Deleting this will REVERSE the balance impact on the user's account.\n\nAre you sure?")) return;

        setDeletingId(id);
        try {
            const res = await deleteTransaction(id);
            if (res.success) {
                toast.success("Transaction deleted & balance reverted");
                router.refresh();
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to delete");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className={styles.tableCard}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Account</th>
                            <th>Description</th>
                            <th>Ref ID</th>
                            <th>Amount ({currency})</th>
                            <th className={styles.alignRight}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t) => {
                            const displayAmount = Number(t.amount) * rate;

                            return (
                                <tr key={t.id}>
                                    <td className={styles.dateCell}>
                                        {new Date(t.createdAt).toLocaleDateString()}
                                        <div className={styles.timeText}>
                                            {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.accountCell}>
                                            <Wallet size={14} className={styles.iconMuted} />
                                            <span className={styles.accountType}>{t.account.type}</span>
                                        </div>
                                        <div className={styles.accountNum}>
                                            •••• {t.account.accountNumber.slice(-4)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.descText}>{t.description}</div>
                                        <div className={`${styles.typeBadge} ${t.direction === 'CREDIT' ? styles.creditBadge : styles.debitBadge}`}>
                                            {t.direction === 'CREDIT' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                            {t.direction}
                                        </div>
                                    </td>
                                    <td className={styles.refId}>
                                        {t.referenceId}
                                    </td>
                                    <td className={t.direction === 'CREDIT' ? styles.amountCredit : styles.amountDebit}>
                                        {t.direction === 'CREDIT' ? '+' : '-'}
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(displayAmount)}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button onClick={() => setEditingTrx(t)} className={styles.btnIcon} title="Edit">
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className={`${styles.btnIcon} ${styles.btnDelete}`}
                                                title="Delete"
                                                disabled={deletingId === t.id}
                                            >
                                                {deletingId === t.id ? <Loader2 className={styles.spin} size={16} /> : <Trash2 size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={6} className={styles.empty}>
                                    No transaction history found for this user.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingTrx && (
                <EditModal
                    trx={editingTrx}
                    onClose={() => setEditingTrx(null)}
                    currency={currency}
                    rate={rate}
                />
            )}
        </div>
    );
}

// Sub-component for the Edit Form
function EditModal({ trx, onClose, currency, rate }: { trx: TransactionWithAccount, onClose: () => void, currency: string, rate: number }) {
    const router = useRouter();
    const [state, action, isPending] = useActionState(updateTransaction, undefined);

    useEffect(() => {
        if (state) {
            if (state.success) {
                toast.success(state.message || "Transaction Updated!");
                onClose();
                router.refresh()
            } else {
                toast.error(state.message || "Update failed");
            }
        }
    }, [state, onClose, router]);

    const dateStr = new Date(trx.createdAt).toISOString().split('T')[0];
    const initialAmount = (Number(trx.amount) * rate).toFixed(2);

    const handleSubmit = (formData: FormData) => {
        const inputAmount = parseFloat(formData.get("amount") as string);

        if (!isNaN(inputAmount)) {
            const usdAmount = inputAmount / rate;
            formData.set("amount", usdAmount.toString());
        }

        action(formData);
    }

    return (
        <div className={styles.modalOverlay}>
            <form action={handleSubmit} className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3>Edit Transaction</h3>
                    <button type="button" onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <input type="hidden" name="transactionId" value={trx.id} />

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}><FileText size={18} /> Description</label>
                        <input name="description" defaultValue={trx.description || ''} className={styles.input} required />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><DollarSign size={18} /> Amount ({currency})</label>
                            <input
                                name="amount"
                                type="number"
                                step="0.01"
                                defaultValue={initialAmount}
                                className={styles.input}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><Calendar size={18} /> Date</label>
                            <input name="createdAt" type="date" defaultValue={dateStr} className={styles.input} required />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}><ArrowLeftRight size={18} /> Type</label>
                        <select name="direction" defaultValue={trx.direction} className={styles.input}>
                            <option value="CREDIT">Credit (Incoming +)</option>
                            <option value="DEBIT">Debit (Outgoing -)</option>
                        </select>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose} className={styles.btnCancel}>Cancel</button>
                    <button type="submit" disabled={isPending} className={styles.btnSave}>
                        {isPending ? <><Loader2 className={styles.spin} size={14} /> Saving...</> : "Save & Sync Balance"}
                    </button>
                </div>
            </form>
        </div>
    );
}