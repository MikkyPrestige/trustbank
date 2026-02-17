'use client';

import { useActionState, useEffect, useState } from "react";
import { generateTransactions } from "@/actions/admin/generator";
import { Loader2, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./generator.module.css";

interface GeneratorFormProps {
    accounts: any[];
    rateMap: Record<string, { currency: string, rate: number }>;
}

export default function GeneratorForm({ accounts, rateMap }: GeneratorFormProps) {
    const [state, action, isPending] = useActionState(generateTransactions, undefined);
    const [selectedAccountId, setSelectedAccountId] = useState("");

    // Get current currency context
    const currentContext = selectedAccountId ? rateMap[selectedAccountId] : { currency: "USD", rate: 1 };

    useEffect(() => {
        if (state?.message) {
            if (state.success) toast.success(state.message);
            else toast.error(state.message);
        }
    }, [state]);

    // Intercept form submission to handle conversion
    const handleSubmit = (formData: FormData) => {
        const rawAmount = parseFloat(formData.get("totalAmount") as string);

        if (!isNaN(rawAmount) && currentContext.rate !== 1) {
            // Calculate USD equivalent
            const usdAmount = rawAmount / currentContext.rate;

            // Overwrite the amount sent to server with the USD value
            formData.set("totalAmount", usdAmount.toString());

            // Add metadata for notifications
            formData.append("displayAmount", rawAmount.toString());
            formData.append("displayCurrency", currentContext.currency);
        } else {
            // Even if USD, send these for consistency
            formData.append("displayAmount", rawAmount.toString());
            formData.append("displayCurrency", "USD");
        }

        action(formData);
    };

    return (
        <form action={handleSubmit} className={styles.card}>
            {/* 1. SELECT ACCOUNT */}
            <div className={styles.group}>
                <label className={styles.label}>Target Account</label>
                <select
                    name="accountId"
                    required
                    className={styles.select}
                    defaultValue=""
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                    <option value="" disabled>-- Select User Account --</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                            {acc.user.fullName} ({acc.type}) - {acc.accountNumber}
                        </option>
                    ))}
                </select>
            </div>

            {/* 2. CONFIGURATION ROW */}
            <div className={styles.grid}>
                <div>
                    <label className={styles.label}>Transaction Mode</label>
                    <div className={styles.selectWrapper}>
                        <select name="type" className={styles.select}>
                            <option value="MIXED">Mixed (Realistic)</option>
                            <option value="CREDIT">Credit Only (Deposits)</option>
                            <option value="DEBIT">Debit Only (Spends)</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className={styles.label}>Transaction Count</label>
                    <input
                        name="count"
                        type="number"
                        min="1"
                        max="100"
                        defaultValue="10"
                        className={styles.input}
                    />
                </div>
            </div>

            {/* 3. AMOUNT & DATES */}
            <div className={styles.group}>
                <label className={styles.label}>Net Amount Change ({currentContext.currency})</label>
                <div className={styles.currency}>
                    <span className={styles.currencyContext}>
                        {currentContext.currency}
                    </span>
                    <input
                        name="totalAmount"
                        type="number"
                        placeholder="e.g. 5000"
                        required
                        className={styles.input}
                        style={{ paddingLeft: '3.5rem' }}
                    />
                </div>
                <p className={styles.hint}>
                    The account balance will change by exactly this amount in {currentContext.currency}.
                </p>
            </div>

            <div className={styles.grid}>
                <div>
                    <label className={styles.label}>Start Date</label>
                    <input name="startDate" type="date" className={styles.input} />
                </div>
                <div>
                    <label className={styles.label}>End Date</label>
                    <input name="endDate" type="date" className={styles.input} />
                </div>
            </div>

            {/* 4. CUSTOM NOTE */}
            <div className={styles.group}>
                <label className={styles.label}>Custom Tag / Note (Optional)</label>
                <input
                    name="customNote"
                    type="text"
                    placeholder="e.g. Backdated Salary, Project X"
                    className={styles.input}
                />
                <p className={styles.hint}>
                    This will be appended to the random descriptions.
                </p>
            </div>

            {/* 5. SUBMIT BUTTON */}
            <button disabled={isPending || !selectedAccountId} className={styles.button}>
                {isPending ? <Loader2 className={styles.spin} size={20} /> : <Wand2 size={20} />}
                {isPending ? "Generating..." : "Generate History"}
            </button>
        </form>
    );
}
