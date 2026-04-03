'use client';

import { useActionState, useEffect, useState } from 'react';
import { initiateWireTransfer } from '@/actions/user/wire';
import styles from './styles/wire.module.css';
import Link from 'next/link';
import { ShieldAlert, Users, Save, Globe, Building2, Hash, Lock, Loader2, User, Info } from 'lucide-react';
import { countries } from '@/lib/data/countries';
import toast from 'react-hot-toast';

interface Account {
    id: string;
    type: string;
    availableBalance: number;
    currentBalance: number;
}

interface Beneficiary {
    id: string;
    accountName: string;
    bankName: string;
    accountNumber: string;
    swiftCode?: string | null;
    country?: string;
}

const findBeneficiaryData = (list: Beneficiary[], id?: string) => {
    const emptyState = {
        accountName: "",
        bankName: "",
        country: "US",
        accountNumber: "",
        swiftCode: "",
    };

    if (!id) return emptyState;

    const ben = list.find(b => b.id === id);
    if (ben) {
        return {
            accountName: ben.accountName || "",
            bankName: ben.bankName || "",
            accountNumber: ben.accountNumber || "",
            swiftCode: ben.swiftCode || "",
            country: ben.country || "US",
        };
    }
    return emptyState;
};

function calculateWireFeeUSD(amountUSD: number): number {
    if (amountUSD <= 5000) return 25.00;
    if (amountUSD <= 50000) return 50.00;
    return 100.00;
}

export default function WireForm({
    accounts,
    beneficiaries,
    preSelectedId,
    limit,
    currency,
    rate
}: {
    accounts: Account[],
    beneficiaries: Beneficiary[],
    preSelectedId?: string,
    limit: number,
    currency: string,
    rate: number
}) {
    const [state, action, isPending] = useActionState(initiateWireTransfer, undefined);

    const [selectedBen, setSelectedBen] = useState(preSelectedId || "");
    const [formData, setFormData] = useState(() => findBeneficiaryData(beneficiaries, preSelectedId));
    const [amount, setAmount] = useState("");

    const limitInUserCurrency = limit === Infinity ? Infinity : limit * rate;

    const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedBen(id);
        setFormData(findBeneficiaryData(beneficiaries, id));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (selectedBen) setSelectedBen("");
    };

    const formatBalance = (usdAmount: number) => {
        const converted = usdAmount * rate;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(converted);
    };

    const handleFormSubmit = (formData: FormData) => {
        const inputAmount = Number(formData.get("amount"));

        if (limitInUserCurrency !== Infinity && inputAmount > limitInUserCurrency) {
            toast.error(`Amount exceeds your daily limit of ${formatBalance(limit)}`);
            return;
        }

        const usdAmount = inputAmount / rate;
        formData.set("amount", usdAmount.toString());

        formData.set("displayAmount", inputAmount.toString());
        formData.set("displayCurrency", currency);

        action(formData);
    };

    useEffect(() => {
        if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state]);

    const currentInput = Number(amount);
    const estimatedFeeUSD = calculateWireFeeUSD(currentInput / rate);
    const estimatedFeeNative = estimatedFeeUSD * rate;
    const totalDeductionNative = currentInput + estimatedFeeNative;

    // Success Modal
    if (state?.success) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <div className={styles.modalIconBox}>
                        <ShieldAlert size={40} strokeWidth={2.5} />
                    </div>
                    <h2 className={styles.modalTitle}>Wire Initiated</h2>
                    <div className={styles.modalText}>
                        <p>Your wire request has been submitted to the SWIFT network queue.</p>
                        <div className={styles.complianceBox}>
                            <p className={styles.complianceHeader}>
                                <ShieldAlert size={16} /> ACTION REQUIRED
                            </p>
                            <p className={styles.complianceText}>
                                International compliance requires <strong>Clearance Verification</strong> (COT/IMF Codes) before funds are released.
                            </p>
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <Link href="/dashboard/wire/status" className={styles.primaryBtn}>
                            Enter Clearance Codes →
                        </Link>
                        <Link href="/dashboard" className={styles.secondaryBtn}>
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form action={handleFormSubmit} className={styles.card}>
            <div className={styles.group}>
                <label className={styles.label}>Source Account</label>
                <select name="accountId" className={styles.select} required defaultValue="">
                    <option value="" disabled>Select Account</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.type} — Avail: {formatBalance(acc.availableBalance)}
                        </option>
                    ))}
                </select>
            </div>

            {beneficiaries.length > 0 && (
                <div className={styles.quickFillGroup}>
                    <label className={`${styles.label} ${styles.quickFillLabel}`}>
                        <Users size={16} className={styles.iconLeft} /> Quick Fill Beneficiary
                    </label>
                    <select
                        value={selectedBen}
                        onChange={handleBeneficiaryChange}
                        className={styles.select}
                        style={{ borderColor: selectedBen ? 'var(--primary)' : 'var(--border-subtle)' }}
                    >
                        <option value="">-- Select Saved Beneficiary --</option>
                        {beneficiaries.map(b => (
                            <option key={b.id} value={b.id}>{b.accountName} - {b.bankName}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.group}>
                <label className={styles.label}>
                    <User size={16} className={styles.iconLeft} /> Beneficiary Name
                </label>
                <input
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe / Tesla Inc."
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>
                        <Building2 size={16} className={styles.iconLeft} /> Bank Name
                    </label>
                    <input name="bankName" value={formData.bankName} onChange={handleInputChange} placeholder="e.g. Barclays London" required className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>
                        <Globe size={16} className={styles.iconLeft} /> Country
                    </label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className={styles.select}>
                        {countries.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>
                    <Hash size={16} className={styles.iconLeft} /> IBAN / Account Number
                </label>
                <input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required className={styles.input} placeholder="GB29 BARC 2020..." />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>SWIFT / BIC Code</label>
                <input
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="International (BARCGB22)"
                    required
                />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Amount ({currency})</label>
                <div className={styles.amountWrapper}>
                    <span className={styles.currencyPrefix}>
                        {currency}
                    </span>
                    <input
                        name="amount"
                        type="number"
                        required
                        className={`${styles.input} ${styles.inputPrefix}`}
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        max={limitInUserCurrency === Infinity ? undefined : limitInUserCurrency}
                    />
                </div>

                {amount && !isNaN(Number(amount)) && (
                    <div className={styles.feeBreakdown}>
                        <div className={styles.feeRow}>
                            <span>Transfer Amount:</span>
                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(Number(amount))}</span>
                        </div>
                        <div className={styles.feeRow}>
                            <span>Service Fee (Est.):</span>
                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(estimatedFeeNative)}</span>
                        </div>
                        <div className={`${styles.feeRow} ${styles.totalRow}`}>
                            <span>Total Deduction:</span>
                            <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(totalDeductionNative)}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.securityBox}>
                <label className={`${styles.label} ${styles.pinLabel}`}>
                    <Lock size={16} className={styles.iconLeft} /> Authorize Transaction
                </label>
                <input name="pin" type="password" maxLength={4} required className={styles.pinInput} placeholder="••••" />
                <p className={styles.pinHelpText}>
                    Enter your 4-digit security PIN to sign this digital wire.
                </p>
            </div>

            {!selectedBen && (
                <div className={styles.checkboxWrapper}>
                    <input type="checkbox" id="saveWireBen" name="saveBeneficiary" className={styles.checkbox} />
                    <label htmlFor="saveWireBen" className={styles.checkboxLabel}>
                        Save to my beneficiaries
                    </label>
                </div>
            )}

            <div className={styles.buttonWrapper}>
            <button disabled={isPending} className={styles.button}>
                {isPending ? <><Loader2 className={styles.spin} size={20} /> Processing SWIFT...</> : 'Initiate Wire Transfer'}
            </button>
            </div>
        </form>
    );
}
