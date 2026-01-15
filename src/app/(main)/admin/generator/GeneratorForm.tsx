'use client';

import { useActionState, useEffect } from "react";
import { generateTransactions } from "@/actions/admin/generator";
import { Loader2, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./generator.module.css";

export default function GeneratorForm({ accounts }: { accounts: any[] }) {
    const [state, action, isPending] = useActionState(generateTransactions, undefined);

    useEffect(() => {
        if (state?.message) {
            if (state.success) toast.success(state.message);
            else toast.error(state.message);
        }
    }, [state]);

    return (
        <form action={action} className={styles.card}>
            {/* 1. SELECT ACCOUNT */}
            <div className={styles.group}>
                <label className={styles.label}>Target Account</label>
                <select name="accountId" required className={styles.select} defaultValue="">
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
                    <select name="type" className={styles.select}>
                        <option value="MIXED">🔀 Mixed (Realistic)</option>
                        <option value="CREDIT">⬇️ Credit Only (Deposits)</option>
                        <option value="DEBIT">⬆️ Debit Only (Spends)</option>
                    </select>
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
                <label className={styles.label}>Net Amount Change ($)</label>
                <input
                    name="totalAmount"
                    type="number"
                    placeholder="e.g. 50000"
                    required
                    className={styles.input}
                />
                <p className={styles.hint}>
                    The account balance will increase/decrease by exactly this amount.
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

            {/* 4. CUSTOM NOTE (NEW) */}
            <div className={styles.group}>
                <label className={styles.label}>Custom Tag / Note (Optional)</label>
                <input
                    name="customNote"
                    type="text"
                    placeholder="e.g. Backdated Salary, Project X"
                    className={styles.input}
                />
                <p className={styles.hint}>
                    This will be appended to the random descriptions (e.g. &quot;Uber Ride - Project X&quot;).
                </p>
            </div>

            {/* 5. SUBMIT BUTTON */}
            <button disabled={isPending} className={styles.button}>
                {isPending ? <Loader2 className="spin" /> : <Wand2 size={20} />}
                {isPending ? "Generating..." : "Generate History"}
            </button>
        </form>
    );
}