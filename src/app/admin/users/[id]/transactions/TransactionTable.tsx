'use client';

import { useState } from "react";
import { deleteTransaction, updateTransaction } from "@/actions/admin/transaction";
import { Pencil, Trash2, X, Calendar, FileText, DollarSign, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./transactions.module.css";
import { useActionState } from "react";

export default function TransactionTable({ transactions }: { transactions: any[] }) {
    const [editingTrx, setEditingTrx] = useState<any>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ Deleting this will REVERSE the balance impact on the user's account.\n\nContinue?")) return;

        try {
            const res = await deleteTransaction(id);
            if (res.success) toast.success("Transaction deleted & balance reverted");
            else toast.error(res.message);
        } catch (err) {
            toast.error("Failed to delete");
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
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((t) => (
                            <tr key={t.id}>
                                <td style={{ whiteSpace: 'nowrap', color: '#888' }}>
                                    {new Date(t.createdAt).toLocaleDateString()}
                                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ccc' }}>
                                        <Wallet size={14} color="#666" />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                            {t.account.type}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#666', paddingLeft: '20px' }}>
                                        •••• {t.account.accountNumber.slice(-4)}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: '500', color: '#eee' }}>{t.description}</div>
                                    <div className={styles.typeBadge}>
                                        {t.direction === 'CREDIT' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                                        {t.direction}
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace', color: '#666', fontSize: '0.85rem' }}>
                                    {t.referenceId}
                                </td>
                                <td className={t.direction === 'CREDIT' ? styles.amountCredit : styles.amountDebit}>
                                    {t.direction === 'CREDIT' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(t.amount))}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button onClick={() => setEditingTrx(t)} className={styles.btnIcon} title="Edit">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className={`${styles.btnIcon} ${styles.btnDelete}`} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.empty}>
                                    No transaction history found for this user.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* EDIT MODAL */}
            {editingTrx && (
                <EditModal
                    trx={editingTrx}
                    onClose={() => setEditingTrx(null)}
                />
            )}
        </div>
    );
}

// Sub-component for the Edit Form
function EditModal({ trx, onClose }: { trx: any, onClose: () => void }) {
    const [state, action, isPending] = useActionState(updateTransaction, undefined);

    if (state?.success) {
        toast.success("Transaction Updated!");
        onClose();
    }

    const dateStr = new Date(trx.createdAt).toISOString().split('T')[0];

    return (
        <div className={styles.modalOverlay}>
            <form action={action} className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h3>Edit Transaction</h3>
                    <button type="button" onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
                </div>

                <input type="hidden" name="transactionId" value={trx.id} />

                <div className={styles.modalBody}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}><FileText size={14} /> Description</label>
                        <input name="description" defaultValue={trx.description} className={styles.input} required />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}><DollarSign size={14} /> Amount</label>
                            <input name="amount" type="number" step="0.01" defaultValue={trx.amount} className={styles.input} required />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}><Calendar size={14} /> Date</label>
                            <input name="createdAt" type="date" defaultValue={dateStr} className={styles.input} required />
                        </div>
                    </div>

                    {/* 👇 NEW: Direction Selector */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}><ArrowLeftRight size={14} /> Type</label>
                        <select name="direction" defaultValue={trx.direction} className={styles.input}>
                            <option value="CREDIT">Credit (Incoming +)</option>
                            <option value="DEBIT">Debit (Outgoing -)</option>
                        </select>
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose} className={styles.btnCancel}>Cancel</button>
                    <button type="submit" disabled={isPending} className={styles.btnSave}>
                        {isPending ? "Saving..." : "Save & Sync Balance"}
                    </button>
                </div>
            </form>
        </div>
    );
}