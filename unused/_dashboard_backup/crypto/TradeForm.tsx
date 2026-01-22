'use client';

import { useActionState, useState, useEffect } from 'react';
import { tradeCrypto } from '@/actions/user/crypto';
import styles from './crypto.module.css';
import { RefreshCw, ArrowRightLeft, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

// ✅ UPDATE: Matches the shape of the 'priceMap' we created in the page
interface TradeFormProps {
    livePrices: Record<string, { price: number; change: number }>;
}

export default function TradeForm({ livePrices }: TradeFormProps) {
    const [state, action, isPending] = useActionState(tradeCrypto, undefined);
    const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
    const [currency, setCurrency] = useState('BTC'); // Default to BTC
    const [amount, setAmount] = useState('');

    // ✅ UPDATE: Access price directly using the symbol (No map needed)
    // livePrices is now { "BTC": { price: 90000... }, "ETH": ... }
    const currentPrice = livePrices[currency]?.price || 0;

    const estimate = amount && currentPrice > 0
        ? (Number(amount) / currentPrice).toFixed(6) + ` ${currency}`
        : '---';

    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
                const timer = setTimeout(() => {
                    setAmount('');
                }, 0);
                return () => clearTimeout(timer);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    // Get list of available symbols from the livePrices object
    const availableSymbols = Object.keys(livePrices).filter(s => s !== 'HYPE'); // Filter out HYPE if you want, or keep it

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
                        {/* ✅ UPDATE: Dynamic options based on available data */}
                        {availableSymbols.map(sym => (
                            <option key={sym} value={sym}>
                                {sym} - ${livePrices[sym].price.toLocaleString()}
                            </option>
                        ))}
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