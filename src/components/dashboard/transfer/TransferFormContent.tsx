'use client';

import { useState, useActionState, useEffect } from 'react';
import { processTransfer } from '@/actions/user/transfer';
import { Send, CreditCard, Lock, Save, User, Building, Hash, Loader2, CheckCircle, Users, Globe } from 'lucide-react';
import styles from "./transfer.module.css";
import toast from 'react-hot-toast';
import Link from 'next/link';

const initialState = { message: '', success: false };

interface Beneficiary {
    id: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
    routingNumber?: string | null;
}

interface ContentProps {
    accounts: any[];
    beneficiaries: Beneficiary[];
    preSelectedId?: string;
    onReset: () => void;
    limit: number;
}

const findBeneficiaryData = (list: Beneficiary[], id?: string) => {
    // Default empty state
    const empty = { accountName: "", bankName: "", accountNumber: "", routingNumber: "" };

    if (!id) return empty;

    const ben = list.find(b => b.id === id);
    if (ben) {
        return {
            accountName: ben.accountName || "",
            bankName: ben.bankName || "",
            accountNumber: ben.accountNumber || "",
            routingNumber: ben.routingNumber || "",
        };
    }
    return empty;
};

export default function TransferFormContent({ accounts, beneficiaries, preSelectedId, onReset, limit }: ContentProps) {
    const [state, action, isPending] = useActionState(processTransfer, initialState);

    const [selectedBen, setSelectedBen] = useState(preSelectedId || "");
    const [formData, setFormData] = useState(() => findBeneficiaryData(beneficiaries, preSelectedId));
    const [amount, setAmount] = useState("");

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

    const handleFormSubmit = (formData: FormData) => {
        const inputAmount = Number(formData.get("amount"));

        if (limit !== Infinity && inputAmount > limit) {
            toast.error(`Amount exceeds your daily limit of $${limit.toLocaleString()}`);
            return;
        }

        action(formData);
    };

    // --- SUCCESS VIEW ---
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
                                <strong className={styles.receiptValue}>
                                    {amount ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(amount)) : '$0.00'}
                                </strong>
                            </div>
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <Link href="/dashboard" className={styles.secondaryBtn}>Go to Dashboard</Link>
                        <button onClick={onReset} className={styles.primaryBtn}>Make Another Transfer</button>
                    </div>
                </div>
            </div>
        );
    }

    // --- FORM VIEW ---
    return (
        <form action={handleFormSubmit} className={styles.formGrid}>

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
                    <div className={styles.quickFillRow}>
                        <label className={styles.quickFillLabel}>
                            <Users size={16} /> Quick Fill
                        </label>
                        <select
                            value={selectedBen}
                            onChange={handleBeneficiaryChange}
                            className={`${styles.miniSelect} ${selectedBen ? styles.miniSelectActive : ''}`}
                        >
                            <option value="">-- Select Beneficiary --</option>
                            {beneficiaries.map(b => (
                                <option key={b.id} value={b.id}>{b.accountName} - {b.bankName}</option>
                            ))}
                        </select>
                    </div>
                )}

                <h3 className={styles.secTitle}>Recipient Details</h3>
                {/* BANK NAME */}
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

                {/* ACCOUNT NUMBER & ROUTING NUMBER */}
                <div className={styles.row}>
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
                    <div className={styles.inputGroup}>
                        <Globe className={styles.icon} size={18} />
                        <input
                            name="routingNumber"
                            value={formData.routingNumber}
                            onChange={handleInputChange}
                            placeholder="Routing Number"
                            className={styles.input}
                            required
                        />
                    </div>
                </div>

                {/* HOLDER NAME */}
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
                            max={limit === Infinity ? undefined : limit}
                        />
                    </div>
                    <div className={`${styles.inputGroup} ${styles.pinGroup}`}>
                        <Lock className={styles.icon} size={18} />
                        <input
                            name="pin"
                            type="password"
                            maxLength={4}
                            placeholder="PIN"
                            className={`${styles.input} ${styles.pinField}`}
                            required
                        />
                    </div>
                </div>
                <div className={styles.inputGroup}>
                    <input
                        name="note"
                        placeholder="Description (Optional)"
                        className={`${styles.input} ${styles.noteField}`}
                    />
                </div>
            </div>

            <button disabled={isPending} className={styles.submitBtn}>
                {isPending ? <Loader2 className={styles.spin} /> : <><Send size={20} /> Send Funds Now</>}
            </button>
        </form>
    );
}