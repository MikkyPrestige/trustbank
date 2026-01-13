'use client';

import { useActionState, useState, useEffect } from 'react';
import { tradeCrypto } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { RefreshCw, ArrowRightLeft, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface TradeFormProps {
    livePrices: {
        [key: string]: {
            usd: number;
            usd_24h_change?: number;
        };
    };
}

const COIN_MAP: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'HYPE': 'hype'
};

export default function TradeForm({ livePrices }: TradeFormProps) {
    const [state, action, isPending] = useActionState(tradeCrypto, undefined);
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [currency, setCurrency] = useState('BTC');
    const [amount, setAmount] = useState('');

    const geckoId = COIN_MAP[currency] || 'bitcoin';
    const currentPrice = livePrices[geckoId]?.usd || 0;

    const estimate = amount && currentPrice > 0
        ? (Number(amount) / currentPrice).toFixed(6) + ` ${currency}`
        : '---';

    // 👇 FIXED: Wrapped setAmount in setTimeout
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);

                // Fix: Push state update to next tick
                const timer = setTimeout(() => {
                    setAmount('');
                }, 0);
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    return (
        <div className={styles.tradeCard}>
            <div className={styles.tradeHeader}>
                <h3><Activity size={18} style={{ marginRight: '8px' }} /> Quick Trade</h3>
                <span className={styles.liveBadge}>
                    <div className={styles.pulse}></div> Live
                </span>
            </div>

            <div className={styles.toggleGroup}>
                <button
                    type="button"
                    onClick={() => setType('BUY')}
                    className={`${styles.toggleBtn} ${type === 'BUY' ? styles.buyActive : ''}`}
                >
                    Buy
                </button>
                <button
                    type="button"
                    onClick={() => setType('SELL')}
                    className={`${styles.toggleBtn} ${type === 'SELL' ? styles.sellActive : ''}`}
                >
                    Sell
                </button>
            </div>

            <form action={action} className={styles.form}>
                <input type="hidden" name="type" value={type} />

                <div className={styles.group}>
                    <label>Select Asset</label>
                    <select
                        name="currency"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className={styles.select}
                    >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="SOL">Solana (SOL)</option>
                    </select>
                </div>

                <div className={styles.group}>
                    <label>
                        {type === 'BUY' ? 'Pay Amount (USD)' : 'Sell Value (USD)'}
                    </label>
                    <input
                        name="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className={styles.input}
                        style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
                    />
                </div>

                <div className={styles.estimateBox}>
                    <span>Rate: 1 {currency} = ${currentPrice.toLocaleString()}</span>
                    <div className={styles.conversion}>
                        {amount ? `≈ ${estimate}` : '0.00'}
                    </div>
                </div>

                <button disabled={isPending} className={styles.submitBtn}>
                    {isPending ? <RefreshCw className={styles.spin} size={20} /> : <ArrowRightLeft size={20} />}
                    {type === 'BUY' ? 'Execute Buy Order' : 'Execute Sell Order'}
                </button>
            </form>
        </div>
    );
}