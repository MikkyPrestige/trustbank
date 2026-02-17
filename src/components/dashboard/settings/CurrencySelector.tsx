'use client';

import { useState, useTransition } from "react";
import { updateUserCurrency } from "@/actions/user/settings";
import { Check, Globe, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./styles/currency-selector.module.css";

const CURRENCIES = [
    { code: "USD", label: "US Dollar", symbol: "$" },
    { code: "EUR", label: "Euro", symbol: "€" },
    { code: "GBP", label: "British Pound", symbol: "£" },
    { code: "ZAR", label: "South African Rand", symbol: "R" },
    { code: "JPY", label: "Japanese Yen", symbol: "¥" },
    { code: "CAD", label: "Canadian Dollar", symbol: "C$" },
    { code: "AUD", label: "Australian Dollar", symbol: "A$" },
    { code: "CHF", label: "Swiss Franc", symbol: "Fr" },
    { code: "CNY", label: "Chinese Yuan", symbol: "¥" },
    { code: "INR", label: "Indian Rupee", symbol: "₹" },
];

export default function CurrencySelector({ currentCurrency }: { currentCurrency: string }) {
    const [isPending, startTransition] = useTransition();
    const [active, setActive] = useState(currentCurrency);
    const router = useRouter();

    const handleSelect = (code: string) => {
        if (code === active) return; // Prevent unnecessary calls

        setActive(code); // Optimistic update

        startTransition(async () => {
            const res = await updateUserCurrency(code);
            if (res.success) {
                toast.success(res.message);
                router.refresh(); // Refresh server data
            } else {
                toast.error(res.message);
                setActive(currentCurrency); // Revert on fail
            }
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconBox}>
                    <Globe size={20} />
                </div>
                <div>
                    <h3 className={styles.title}>Display Currency</h3>
                    <p className={styles.subtitle}>Select your preferred currency for viewing balances.</p>
                </div>
            </div>

            <div className={styles.grid}>
                {CURRENCIES.map((c) => (
                    <button
                        key={c.code}
                        onClick={() => handleSelect(c.code)}
                        disabled={isPending}
                        className={`
                            ${styles.card}
                            ${active === c.code ? styles.cardActive : ''}
                        `}
                    >
                        <div className={styles.cardInfo}>
                            <span className={styles.symbol}>{c.symbol}</span>
                            <span className={styles.label}>{c.label}</span>
                        </div>

                        {active === c.code && (
                            <div className={styles.statusIcon}>
                                {isPending ? (
                                    <Loader2 size={16} className={styles.spin} />
                                ) : (
                                    <Check size={16} strokeWidth={3} />
                                )}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}