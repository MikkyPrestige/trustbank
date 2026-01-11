'use client';

import { useActionState, useEffect, useState } from 'react';
import { initiateWireTransfer } from '@/actions/wire';
import styles from './wire.module.css';
import Link from 'next/link';
import { CheckCircle, ShieldAlert, Users, Save, Globe, Building2, Hash, Lock, Loader2 } from 'lucide-react';
import { countries } from '@/lib/countries';
import toast from 'react-hot-toast';

export default function WireForm({
    accounts,
    beneficiaries,
    preSelectedId
}: {
    accounts: any[],
    beneficiaries: any[],
    preSelectedId?: string
}) {
    const [state, action, isPending] = useActionState(initiateWireTransfer, undefined);


    const getInitialData = () => {
        if (preSelectedId) {
            const ben = beneficiaries.find(b => b.id === preSelectedId);
            if (ben) {
                return {
                    selected: preSelectedId,
                    data: {
                        bankName: ben.bankName,
                        accountNumber: ben.accountNumber,
                        swiftCode: ben.swiftCode || "",
                        country: ben.country || "US", // Default if not saved
                    }
                };
            }
        }
        // Default empty state
        return {
            selected: "",
            data: { bankName: "", country: "US", accountNumber: "", swiftCode: "" }
        };
    };

    const [selectedBen, setSelectedBen] = useState(() => getInitialData().selected);
    const [formData, setFormData] = useState(() => getInitialData().data);

    const handleBeneficiaryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedBen(id);

        if (id) {
            const ben = beneficiaries.find(b => b.id === id);
            if (ben) {
                setFormData({
                    bankName: ben.bankName,
                    accountNumber: ben.accountNumber,
                    swiftCode: ben.swiftCode || "",
                    country: "US",
                });
            }
        } else {
            setFormData({ bankName: "", accountNumber: "", swiftCode: "", country: "US" });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (selectedBen) setSelectedBen("");
    };

    useEffect(() => {
        if (state?.message) {
            if (!state.success) {
                toast.error(state.message);
            }
        }
    }, [state]);


    if (state?.success) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <div className={styles.modalIconBox}>
                        <CheckCircle size={48} strokeWidth={3} />
                    </div>
                    <h2 className={styles.modalTitle}>Transfer Initiated</h2>
                    <div className={styles.modalText}>
                        <p>Your wire transfer request has been successfully submitted to the processing queue.</p>
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                            <p style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                                <ShieldAlert size={18} /> Action Required
                            </p>
                            <p style={{ fontSize: '0.9rem' }}>
                                For international security compliance, this transaction requires <strong>Clearance Verification</strong> (TAA, COT, IMF codes).
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
            <div className={styles.group}>
                <label className={styles.label}>Source Account</label>
                <select name="accountId" className={styles.select} required defaultValue="">
                    <option value="" disabled>Select Account</option>
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.type} - {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(acc.availableBalance))}
                        </option>
                    ))}
                </select>
            </div>

            {beneficiaries.length > 0 && (
                <div className={styles.group} style={{ marginTop: '1rem', borderTop: '1px dashed #333', paddingTop: '1rem' }}>
                    <label className={styles.label} style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} /> Quick Fill
                    </label>
                    <select
                        value={selectedBen}
                        onChange={handleBeneficiaryChange}
                        className={styles.select}
                        style={{ borderColor: selectedBen ? '#3b82f6' : '#333' }}
                    >
                        <option value="">-- Select Beneficiary --</option>
                        {beneficiaries.map(b => (
                            <option key={b.id} value={b.id}>{b.accountName} - {b.bankName}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}><Building2 size={12} style={{ marginRight: '4px' }} /> Bank Name</label>
                    <input
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        placeholder="e.g. Barclays London"
                        required
                        className={styles.input}
                    />
                </div>

                {/* 👇 UPDATED COUNTRY SELECTOR */}
                <div className={styles.group}>
                    <label className={styles.label}><Globe size={12} style={{ marginRight: '4px' }} /> Country</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={styles.select}
                    >
                        {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}><Hash size={12} style={{ marginRight: '4px' }} /> IBAN / Account Number</label>
                <input
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                    placeholder="GB29 BARC 2020..."
                />
            </div>

            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>SWIFT / BIC Code</label>
                    <input
                        name="swiftCode"
                        value={formData.swiftCode}
                        onChange={handleInputChange}
                        required
                        className={styles.input}
                        placeholder="BARCGB22"
                    />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Amount (USD)</label>
                    <input name="amount" type="number" required className={styles.input} placeholder="0.00" />
                </div>
            </div>

            <div className={styles.securityBox}>
                <label className={styles.label} style={{ marginBottom: '1rem', display: 'block' }}>
                    <Lock size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />
                    Authorize Transaction
                </label>
                <input name="pin" type="password" maxLength={4} required className={styles.pinInput} placeholder="••••" />
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>
                    Enter your 4-digit security PIN to sign this transfer.
                </p>
            </div>

            {!selectedBen && (
                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <input type="checkbox" id="saveWireBen" name="saveBeneficiary" style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
                    <label htmlFor="saveWireBen" style={{ color: '#ccc', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Save size={14} /> Save to my beneficiaries
                    </label>
                </div>
            )}

            <button disabled={isPending} className={styles.button}>
                {isPending ? <><Loader2 className="spin" size={20} /> Processing...</> : 'Initiate Wire Transfer'}
            </button>
        </form>
    );
}