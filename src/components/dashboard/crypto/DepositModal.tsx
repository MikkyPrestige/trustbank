'use client';

import { useState, useActionState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { generateWallet } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { Plus, X, Wallet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SUPPORTED_COINS = [
    { code: 'USDT', name: 'Tether' },
    { code: 'BTC', name: 'Bitcoin' },
    { code: 'ETH', name: 'Ethereum' },
    { code: 'SOL', name: 'Solana' },
    { code: 'BNB', name: 'Binance' },
    { code: 'HYPE', name: 'HyperLiquid' },
    { code: 'XRP', name: 'Ripple' },
    { code: 'ADA', name: 'Cardano' },
    { code: 'DOT', name: 'PolkaDot' },
    { code: 'DOGE', name: 'DogeCoin' }
];

export default function DepositModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState('BTC');

    const [state, action, isPending] = useActionState(generateWallet, undefined);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
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
            <button onClick={() => setIsOpen(true)} className={styles.walletBtn}>
                <Plus size={18} /> New Wallet
            </button>

            {isOpen && createPortal(
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Create Crypto Wallet</h3>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}><X size={20} /></button>
                        </div>

                        <p className={styles.modalDesc}>
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