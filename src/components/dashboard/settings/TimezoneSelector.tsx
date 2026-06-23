'use client';

import { useState, useTransition, useEffect } from "react";
import { updateUserTimezone } from "@/actions/user/settings";
import { Clock, Loader2, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { TIMEZONES, TIMEZONE_REGIONS } from "@/lib/constants/timezones";
import styles from "./styles/timezone-selector.module.css";

export default function TimezoneSelector({ currentTimezone }: { currentTimezone: string }) {
    const [isPending, startTransition] = useTransition();
    const [selected, setSelected] = useState(currentTimezone);
    const [detected, setDetected] = useState<string | null>(null);

    useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const match = TIMEZONES.find(t => t.value === tz);
        if (match && match.value !== currentTimezone) setDetected(match.value);
    }, [currentTimezone]);

    const handleChange = (value: string) => {
        if (value === selected) return;
        setSelected(value);
        startTransition(async () => {
            const res = await updateUserTimezone(value);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
                setSelected(currentTimezone);
            }
        });
    };

    const handleDetect = () => {
        if (detected) handleChange(detected);
    };

    const detectedLabel = detected ? TIMEZONES.find(t => t.value === detected)?.label : null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconBox}><Clock size={20} /></div>
                <div>
                    <h3 className={styles.title}>Display Timezone</h3>
                    <p className={styles.subtitle}>Transaction times on receipts will use this timezone.</p>
                </div>
            </div>

            {detected && (
                <div className={styles.detectBanner}>
                    <MapPin size={14} />
                    <span>Detected: <strong>{detectedLabel}</strong></span>
                    <button onClick={handleDetect} disabled={isPending} className={styles.detectBtn}>
                        Use this
                    </button>
                </div>
            )}

            <div className={styles.selectWrap}>
                <select
                    value={selected}
                    onChange={e => handleChange(e.target.value)}
                    disabled={isPending}
                    className={styles.select}
                >
                    {TIMEZONE_REGIONS.map(region => (
                        <optgroup key={region} label={region}>
                            {TIMEZONES.filter(t => t.region === region).map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                {isPending && <Loader2 size={18} className={styles.spin} />}
            </div>
        </div>
    );
}
