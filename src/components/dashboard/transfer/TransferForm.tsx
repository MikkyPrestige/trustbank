'use client';

import { useState, useActionState, useEffect } from 'react';
import { processTransfer } from '@/actions/user/transfer';
import { Send, CreditCard, Lock, Save, User, Building, Hash, Loader2, CheckCircle, Users } from 'lucide-react';
import styles from "./transfer.module.css";
import toast from 'react-hot-toast';
import Link from 'next/link';

const initialState = { message: '', success: false };

interface Beneficiary {
    id: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
}

// ✅ Robust Helper
const findBeneficiaryData = (list: Beneficiary[], id?: string) => {
    if (!id) return { accountName: "", bankName: "", accountNumber: "" };
    const ben = list.find(b => b.id === id);
    if (ben) {
        return {
            accountName: ben.accountName || "",
            bankName: ben.bankName || "",
            accountNumber: ben.accountNumber || "",
        };
    }
    return { accountName: "", bankName: "", accountNumber: "" };
};

export default function TransferForm({
    accounts,
    beneficiaries,
    preSelectedId
}: {
    accounts: any[],
    beneficiaries: any[],
    preSelectedId?: string
}) {
    const [state, action, isPending] = useActionState(processTransfer, initialState);

    const [selectedBen, setSelectedBen] = useState(preSelectedId || "");
    const [formData, setFormData] = useState(() => findBeneficiaryData(beneficiaries, preSelectedId));
    const [amount, setAmount] = useState("");

    // Handle Toast
    useEffect(() => {
        if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state]);

    const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedBen(id);
        setFormData(findBeneficiaryData(beneficiaries, id));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (selectedBen) setSelectedBen("");
    };

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // --- SUCCESS MODAL ---
    if (state.success) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <div className={styles.modalIconBox}>
                        <CheckCircle size={48} strokeWidth={3} />
                    </div>
                    <h2 className={styles.modalTitle}>Transfer Successful</h2>
                    <div className={styles.modalText}>
                        <p>Your transaction has been processed successfully.</p>
                        <div className={styles.receiptBox}>
                            <div className={styles.receiptRow}>
                                <span>Sent To</span>
                                <strong>{formData.accountName}</strong>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Bank</span>
                                <strong>{formData.bankName}</strong>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Amount</span>
                                <strong style={{ color: '#22c55e' }}>
                                    {amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount)) : '$0.00'}
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <Link href="/dashboard" className={styles.secondaryBtn}>Go to Dashboard</Link>
                        <button onClick={() => window.location.reload()} className={styles.primaryBtn}>Make Another Transfer</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form action={action} className={styles.formGrid}>
            {/* FROM ACCOUNT */}
            <div className={styles.section}>
                <h3 className={styles.secTitle}>From Account</h3>
                <div className={styles.inputGroup}>
                    <CreditCard className={styles.icon} size={18} />
                    <select name="sourceAccountId" className={styles.select} required defaultValue="">
                        <option value="" disabled>Select Source Account</option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.type} — Avail: {formatMoney(acc.availableBalance)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* RECIPIENT */}
            <div className={styles.section}>
                {beneficiaries.length > 0 && (
                    <div className={styles.flexHead} style={{ marginBottom: '15px' }}>
                        <label className={styles.label} style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} /> Quick Fill
                        </label>
                        <select
                            value={selectedBen}
                            onChange={handleBeneficiaryChange}
                            className={styles.miniSelect}
                            style={{ borderColor: selectedBen ? '#3b82f6' : 'var(--border)' }}
                        >
                            <option value="">-- Select Beneficiary --</option>
                            {beneficiaries.map(b => (
                                <option key={b.id} value={b.id}>{b.accountName} - {b.bankName}</option>
                            ))}
                        </select>
                    </div>
                )}

                <h3 className={styles.secTitle}>Recipient Details</h3>
                <div className={styles.row}>
                    <div className={styles.inputGroup}>
                        <Building className={styles.icon} size={18} />
                        <input
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleInputChange}
                            placeholder="Bank Name"
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <Hash className={styles.icon} size={18} />
                        <input
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleInputChange}
                            placeholder="Account Number"
                            className={styles.input}
                            required
                        />
                    </div>
                </div>

                <div className={styles.inputGroup}>
                    <User className={styles.icon} size={18} />
                    <input
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        placeholder="Account Holder Name"
                        className={styles.input}
                        required
                    />
                </div>

                {!selectedBen && (
                    <div className={styles.saveOption}>
                        <label className={styles.checkboxLabel}>
                            <input type="checkbox" name="saveBeneficiary" className={styles.checkbox} />
                            <Save size={16} className={styles.saveIcon} />
                            <span>Save to beneficiaries</span>
                        </label>
                    </div>
                )}
            </div>

            {/* AMOUNT & PIN */}
            <div className={styles.section}>
                <h3 className={styles.secTitle}>Transfer Amount</h3>
                <div className={styles.row}>
                    <div className={styles.amountWrapper}>
                        <span className={styles.dollarSign}>$</span>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className={styles.amountInput}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup} style={{ flex: '0.6' }}>
                        <Lock className={styles.icon} size={18} />
                        <input
                            name="pin"
                            type="password"
                            maxLength={4}
                            placeholder="PIN"
                            className={styles.input}
                            required
                            style={{ height: '70px', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', paddingLeft: '14px' }}
                        />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <input name="note" placeholder="Description (Optional)" className={styles.input} style={{ paddingLeft: '14px' }} />
                </div>
            </div>

            <button disabled={isPending} className={styles.submitBtn}>
                {isPending ? <Loader2 className={styles.spin} /> : <><Send size={20} /> Send Funds Now</>}
            </button>
        </form>
    );
}