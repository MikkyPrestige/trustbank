'use client';

import { useState, useActionState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateWallet } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { Plus, X, Wallet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SUPPORTED_COINS = [
    { code: 'BTC', name: 'Bitcoin' },
    { code: 'ETH', name: 'Ethereum' },
    { code: 'SOL', name: 'Solana' },
    { code: 'USDT', name: 'Tether' },
    { code: 'XRP', name: 'Ripple' },
    { code: 'ADA', name: 'Cardano' }
];

export default function DepositModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState('BTC');

    const [state, action, isPending] = useActionState(generateWallet, undefined);

    // ✅ FIX 1: Wrap setMounted in setTimeout to avoid sync render warning during hydration
    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // ✅ FIX 2: Wrap setIsOpen in setTimeout to prevent cascading updates
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                // Break the synchronous render cycle
                const timer = setTimeout(() => {
                    setIsOpen(false);
                }, 0);
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    if (!mounted) return null;

    return (
        <>
            <button onClick={() => setIsOpen(true)} className={styles.verifyBtn} style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--text-main)', color: 'var(--bg-app)' }}>
                <Plus size={16} style={{ marginRight: '6px' }} /> New Wallet
            </button>

            {isOpen && createPortal(
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Create Crypto Wallet</h3>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>

                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                            Select a blockchain network to generate a secure deposit address.
                        </p>

                        <form action={action} className={styles.form}>
                            <div className={styles.group}>
                                <label>Select Asset</label>
                                <select
                                    name="symbol"
                                    value={selectedCoin}
                                    onChange={(e) => setSelectedCoin(e.target.value)}
                                    className={styles.select}
                                >
                                    {SUPPORTED_COINS.map(c => (
                                        <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                                    ))}
                                </select>
                            </div>

                            <button disabled={isPending} className={styles.submitBtn}>
                                {isPending ? <Loader2 className={styles.spin} /> : <><Wallet size={18} /> Generate Wallet</>}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}