'use client';

import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import styles from './dashboard.module.css';

export default function AccountCard({ account }: { account: any }) {
    // Default to TRUE (Visible) so they see their money immediately,
    // or FALSE if you want maximum privacy by default.
    const [visible, setVisible] = useState(true);
    const [copied, setCopied] = useState(false);

    // Format Number: "1234567890" -> "**** 7890" vs "1234 5678 90"
    const maskedNumber = `•••• ${account.accountNumber.slice(-4)}`;
    const fullNumber = account.accountNumber.replace(/(\d{4})(?=\d)/g, '$1 '); // Groups of 4

    // Format Balance
    const formattedBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(Number(account.availableBalance));

    const handleCopy = () => {
        navigator.clipboard.writeText(account.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.accountCard}>

            {/* HEADER: Type & Privacy Toggle */}
            <div className={styles.accHeader}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span className={styles.accType}>{account.type}</span>
                    {account.isPrimary && <span className={styles.badge}>Primary</span>}
                </div>

                <button
                    onClick={() => setVisible(!visible)}
                    className={styles.iconBtn}
                    title={visible ? "Hide Details" : "Show Details"}
                >
                    {visible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
            </div>

            {/* BALANCE SECTION */}
            <div className={styles.balanceWrapper}>
                <span className={styles.balanceLabel}>Available Balance</span>
                <div className={styles.balance}>
                    {visible ? formattedBalance : '••••••'}
                </div>
            </div>

            {/* FOOTER: Number & Copy */}
            <div className={styles.accFooter}>
                <div className={styles.accNum}>
                    {visible ? fullNumber : maskedNumber}
                </div>

                <button onClick={handleCopy} className={styles.iconBtn} title="Copy Account Number">
                    {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </button>
            </div>
        </div>
    );
}