'use client';

import { useActionState, useEffect, useState } from 'react';
import { initiateWireTransfer } from '@/actions/user/wire';
import styles from './styles/wire.module.css';
import Link from 'next/link';
import { ShieldAlert, Users, Save, Globe, Building2, Hash, Lock, Loader2, User } from 'lucide-react';
import { countries } from '@/lib/countries';
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
    routingNumber?: string | null;
    country?: string;
}

const findBeneficiaryData = (list: Beneficiary[], id?: string) => {
    const emptyState = {
        accountName: "", // ✅ ADDED
        bankName: "",
        country: "US",
        accountNumber: "",
        swiftCode: "",
        routingNumber: ""
    };

    if (!id) return emptyState;

    const ben = list.find(b => b.id === id);
    if (ben) {
        return {
            accountName: ben.accountName || "", // ✅ ADDED
            bankName: ben.bankName || "",
            accountNumber: ben.accountNumber || "",
            swiftCode: ben.swiftCode || "",
            routingNumber: ben.routingNumber || "",
            country: ben.country || "US",
        };
    }
    return emptyState;
};

export default function WireForm({
    accounts,
    beneficiaries,
    preSelectedId
}: {
    accounts: Account[],
    beneficiaries: Beneficiary[],
    preSelectedId?: string
}) {
    const [state, action, isPending] = useActionState(initiateWireTransfer, undefined);

    // State Initialization
    const [selectedBen, setSelectedBen] = useState(preSelectedId || "");
    const [formData, setFormData] = useState(() => findBeneficiaryData(beneficiaries, preSelectedId));

    // Handlers
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

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Error Handling
    useEffect(() => {
        if (state?.message && !state.success) {
            toast.error(state.message);
        }
    }, [state]);

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
        <form action={action} className={styles.card}>
            {/* 1. SOURCE ACCOUNT */}
            <div className={styles.group}>
                <label className={styles.label}>Source Account</label>
                <select name="accountId" className={styles.select} required defaultValue="">
                    <option value="" disabled>Select Account</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.type} — Avail: {formatMoney(acc.availableBalance)}
                        </option>
                    ))}
                </select>
            </div>

            {/* 2. QUICK FILL */}
            {beneficiaries.length > 0 && (
                <div className={styles.quickFillGroup}>
                    <label className={`${styles.label} ${styles.quickFillLabel}`}>
                        <Users size={16} className={styles.iconLeft} /> Quick Fill Beneficiary
                    </label>
                    <select
                        value={selectedBen}
                        onChange={handleBeneficiaryChange}
                        className={styles.select}
                        style={{ borderColor: selectedBen ? '#3b82f6' : 'var(--border)' }}
                    >
                        <option value="">-- Select Saved Beneficiary --</option>
                        {beneficiaries.map(b => (
                            <option key={b.id} value={b.id}>{b.accountName} - {b.bankName}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* 👇 3. ACCOUNT NAME (THIS WAS MISSING) */}
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

            {/* 4. BANK DETAILS */}
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

            {/* 5. ACCOUNT NUMBER */}
            <div className={styles.group}>
                <label className={styles.label}>
                    <Hash size={16} className={styles.iconLeft} /> IBAN / Account Number
                </label>
                <input name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} required className={styles.input} placeholder="GB29 BARC 2020..." />
            </div>

            {/* 6. ROUTING & SWIFT */}
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>SWIFT / BIC Code</label>
                    <input
                        name="swiftCode"
                        value={formData.swiftCode}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="International (BARCGB22)"
                    />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Routing Number (ABA)</label>
                    <input
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleInputChange}
                        className={styles.input}
                        placeholder="US Domestic (021000021)"
                        maxLength={9}
                    />
                </div>
            </div>

            {/* 7. AMOUNT */}
            <div className={styles.group}>
                <label className={styles.label}>Amount (USD)</label>
                <input name="amount" type="number" required className={styles.input} placeholder="0.00" />
            </div>

            {/* 8. PIN */}
            <div className={styles.securityBox}>
                <label className={`${styles.label} ${styles.pinLabel}`}>
                    <Lock size={16} className={styles.iconLeft} /> Authorize Transaction
                </label>
                <input name="pin" type="password" maxLength={4} required className={styles.pinInput} placeholder="••••" />
                <p className={styles.pinHelpText}>
                    Enter your 4-digit security PIN to sign this digital wire.
                </p>
            </div>

            {/* 9. SAVE */}
            {!selectedBen && (
                <div className={styles.checkboxWrapper}>
                    <input type="checkbox" id="saveWireBen" name="saveBeneficiary" className={styles.checkbox} />
                    <label htmlFor="saveWireBen" className={styles.checkboxLabel}>
                        <Save size={14} /> Save to my beneficiaries
                    </label>
                </div>
            )}

            <button disabled={isPending} className={styles.button}>
                {isPending ? <><Loader2 className={styles.spin} size={20} /> Processing SWIFT...</> : 'Initiate Wire Transfer'}
            </button>
        </form>
    );
}