'use client';

import { useActionState } from "react";
import { updateSystemRules } from "@/actions/admin/system-rules";
import { SYSTEM_DEFINITIONS } from "@/lib/system-definitions";
import { Save, ShieldAlert, DollarSign, Power, Server, Loader2 } from "lucide-react";
import styles from "./system.module.css";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const initialState = {
    success: false,
    message: ""
};

export default function SystemRulesForm({
    initialValues
}: {
    initialValues: Record<string, string>
}) {
    const [state, formAction, isPending] = useActionState(updateSystemRules, initialState);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    const groups = {
        security: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'security'),
        limits: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'limits'),
        features: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'features'),
        system: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'system'),
    };

    return (
        <form action={formAction}>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <ShieldAlert className={styles.cardIcon} size={20} />
                        <h2 className={styles.cardTitle}>Active Defense</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {groups.security.map(([key, def]) => (
                            <div key={key} className={styles.fieldGroup}>
                                <label className={styles.label}>{def.label}</label>
                                <input
                                    type="number"
                                    name={key}
                                    defaultValue={initialValues[key] || def.defaultValue}
                                    className={styles.input}
                                />
                                <p className={styles.helper}>{def.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <DollarSign className={styles.cardIcon} size={20} />
                        <h2 className={styles.cardTitle}>Financial Limits</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {groups.limits.map(([key, def]) => (
                            <div key={key} className={styles.fieldGroup}>
                                <label className={styles.label}>{def.label}</label>
                                <div className={styles.inputWrapper}>
                                    <span className={styles.prefix}>$</span>
                                    <input
                                        type="number"
                                        name={key}
                                        defaultValue={initialValues[key] || def.defaultValue}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Power className={styles.cardIcon} size={20} />
                        <h2 className={styles.cardTitle}>Feature Flags</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {groups.features.map(([key, def]) => (
                            <div key={key} className={styles.toggleRow}>
                                <div>
                                    <label className={styles.toggleLabel}>{def.label}</label>
                                    <p className={styles.helper}>{def.description}</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        name={key}
                                        defaultChecked={initialValues[key] === 'true' || (!initialValues[key] && def.defaultValue === 'true')}
                                        className={styles.switchInput}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${styles.card} ${styles.dangerZone}`}>
                    <div className={styles.cardHeader}>
                        <Server className={styles.cardIcon} size={20} />
                        <h2 className={styles.cardTitle}>System Control</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {groups.system.map(([key, def]) => (
                            <div key={key} className={styles.toggleRow}>
                                {def.type === 'BOOLEAN' && (
                                    <>
                                        <div>
                                            <label className={styles.toggleLabel}>{def.label}</label>
                                            <p className={styles.helper}>{def.description}</p>
                                        </div>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                name={key}
                                                defaultChecked={initialValues[key] === 'true'}
                                            />
                                            <span className={`${styles.slider} ${styles.sliderRed}`}></span>
                                        </label>
                                    </>
                                )}

                                {def.type === 'TEXT' && (
                                    <div style={{ width: '100%' }}>
                                        <label className={styles.label}>{def.label}</label>
                                        <input
                                            type="text"
                                            name={key}
                                            defaultValue={initialValues[key] || def.defaultValue}
                                            className={styles.input}
                                            placeholder={def.defaultValue}
                                        />
                                        <p className={styles.helper}>{def.description}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <div className={styles.actions}>
                <button type="submit" className={styles.saveBtn} disabled={isPending}>
                    {isPending ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
                    {isPending ? "Saving..." : "Save System Configuration"}
                </button>
            </div>
        </form>
    );
}