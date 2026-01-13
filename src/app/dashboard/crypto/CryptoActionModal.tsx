'use client';

import { useState, useActionState, useEffect } from 'react';
import { transferCrypto } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { ArrowUpRight, ArrowDownLeft, Copy, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CryptoActionModal({ asset }: { asset: any }) {
    const [mode, setMode] = useState<'SEND' | 'RECEIVE' | null>(null);
    const [state, action, isPending] = useActionState(transferCrypto, undefined);

    const walletAddress = `0x${asset.userId.slice(0, 8)}...${asset.symbol}Wallet`.toUpperCase();

    // 👇 FIXED: Wrapped setMode in setTimeout
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);

                // Fix: Push modal close to next tick
                const timer = setTimeout(() => {
                    setMode(null);
                }, 0);
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    if (!mode) {
        return (
            <div className={styles.actionButtons}>
                <button onClick={() => setMode('SEND')} className={styles.sendBtn}>
                    <ArrowUpRight size={14} /> Send
                </button>
                <button onClick={() => setMode('RECEIVE')} className={styles.receiveBtn}>
                    <ArrowDownLeft size={14} /> Receive
                </button>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>{mode === 'SEND' ? `Send ${asset.symbol}` : `Receive ${asset.symbol}`}</h3>
                    <button onClick={() => setMode(null)} className={styles.closeBtn}><X size={20} /></button>
                </div>

                {mode === 'RECEIVE' && (
                    <div className={styles.receiveBox}>
                        <div className={styles.qrPlaceholder}>
                            <div className={styles.qrCode}>[ QR CODE ]</div>
                        </div>
                        <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '1rem' }}>
                            Only send <strong>{asset.symbol}</strong> to this address.
                        </p>

                        <div className={styles.addressBox}>
                            <span>{walletAddress}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(walletAddress);
                                    toast.success("Address Copied!");
                                }}
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'SEND' && (
                    <form action={action} className={styles.form}>
                        <input type="hidden" name="symbol" value={asset.symbol} />

                        <div className={styles.group}>
                            <label>Recipient Address</label>
                            <input name="recipient" required placeholder="0x..." className={styles.input} />
                        </div>

                        <div className={styles.group}>
                            <label>Amount ({asset.symbol})</label>
                            <input name="amount" type="number" step="0.000001" placeholder="0.00" className={styles.input} />
                            <div className={styles.balanceHint}>Available: {Number(asset.quantity).toFixed(6)}</div>
                        </div>

                        <div className={styles.group}>
                            <label>Security PIN</label>
                            <input name="pin" type="password" required maxLength={4} placeholder="••••" className={styles.pinInput} />
                        </div>

                        <button disabled={isPending} className={styles.submitBtn}>
                            {isPending ? <Loader2 className={styles.spin} /> : 'Confirm Transfer'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}