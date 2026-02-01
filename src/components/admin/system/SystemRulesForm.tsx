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

    // Optional: Show Toast on change
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    // Helper to group definitions
    const groups = {
        security: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'security'),
        limits: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'limits'),
        features: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'features'),
        system: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'system'),
    };

    return (
        <form action={formAction}>
            <div className={styles.grid}>

                {/* 🛡️ SECURITY GROUP */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <ShieldAlert className={styles.cardIcon} size={20} />
                        <h2>Active Defense</h2>
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

                {/* 💰 LIMITS GROUP */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <DollarSign className={styles.cardIcon} size={20} />
                        <h2>Financial Limits</h2>
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

                {/* ⚙️ FEATURE FLAGS */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Power className={styles.cardIcon} size={20} />
                        <h2>Feature Flags</h2>
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
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ⚠️ SYSTEM CONTROL */}
                <div className={`${styles.card} ${styles.dangerZone}`}>
                    <div className={styles.cardHeader}>
                        <Server className={styles.cardIcon} size={20} />
                        <h2>System Control</h2>
                    </div>
                    <div className={styles.cardContent}>
                        {groups.system.map(([key, def]) => (
                            <div key={key} className={styles.toggleRow}>
                                {/* CASE 1: BOOLEAN (Toggle Switch) */}
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

                                {/* CASE 2: TEXT (New Input Field) */}
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

// 'use client';

// import { useActionState } from "react";
// import { updateSystemRules } from "@/actions/admin/system-rules";
// import { SYSTEM_DEFINITIONS } from "@/lib/system-definitions";
// import { Save, ShieldAlert, DollarSign, Power, Server } from "lucide-react";
// import styles from "./system.module.css";
// import { useEffect } from "react";
// import { toast } from "react-hot-toast";

// const initialState = {
//     success: false,
//     message: ""
// };

// export default function SystemRulesForm({
//     initialValues
// }: {
//     initialValues: Record<string, string>
// }) {
//     // This hook connects the Server Action return value to the UI
//     const [state, formAction, isPending] = useActionState(updateSystemRules, initialState);

//     // Optional: Show Toast on change
//     useEffect(() => {
//         if (state.message) {
//             if (state.success) {
//                 toast.success(state.message);
//             } else {
//                 toast.error(state.message);
//             }
//         }
//     }, [state]);

//     // Helper to group definitions
//     const groups = {
//         security: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'security'),
//         limits: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'limits'),
//         features: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'features'),
//         system: Object.entries(SYSTEM_DEFINITIONS).filter(([_, def]) => def.group === 'system'),
//     };

//     return (
//         <form action={formAction}>
//             <div className={styles.grid}>

//                 {/* 🛡️ SECURITY GROUP */}
//                 <div className={styles.card}>
//                     <div className={styles.cardHeader}>
//                         <ShieldAlert className={styles.cardIcon} size={20} />
//                         <h2>Active Defense</h2>
//                     </div>
//                     <div className={styles.cardContent}>
//                         {groups.security.map(([key, def]) => (
//                             <div key={key} className={styles.fieldGroup}>
//                                 <label className={styles.label}>{def.label}</label>
//                                 <input
//                                     type="number"
//                                     name={key}
//                                     defaultValue={initialValues[key] || def.defaultValue}
//                                     className={styles.input}
//                                 />
//                                 <p className={styles.helper}>{def.description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* 💰 LIMITS GROUP */}
//                 <div className={styles.card}>
//                     <div className={styles.cardHeader}>
//                         <DollarSign className={styles.cardIcon} size={20} />
//                         <h2>Financial Limits</h2>
//                     </div>
//                     <div className={styles.cardContent}>
//                         {groups.limits.map(([key, def]) => (
//                             <div key={key} className={styles.fieldGroup}>
//                                 <label className={styles.label}>{def.label}</label>
//                                 <div className={styles.inputWrapper}>
//                                     <span className={styles.prefix}>$</span>
//                                     <input
//                                         type="number"
//                                         name={key}
//                                         defaultValue={initialValues[key] || def.defaultValue}
//                                         className={styles.input}
//                                     />
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* ⚙️ FEATURE FLAGS */}
//                 <div className={styles.card}>
//                     <div className={styles.cardHeader}>
//                         <Power className={styles.cardIcon} size={20} />
//                         <h2>Feature Flags</h2>
//                     </div>
//                     <div className={styles.cardContent}>
//                         {groups.features.map(([key, def]) => (
//                             <div key={key} className={styles.toggleRow}>
//                                 <div>
//                                     <label className={styles.toggleLabel}>{def.label}</label>
//                                     <p className={styles.helper}>{def.description}</p>
//                                 </div>
//                                 <label className={styles.switch}>
//                                     <input
//                                         type="checkbox"
//                                         name={key}
//                                         defaultChecked={initialValues[key] === 'true' || (!initialValues[key] && def.defaultValue === 'true')}
//                                     />
//                                     <span className={styles.slider}></span>
//                                 </label>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* ⚠️ SYSTEM CONTROL */}
//                 <div className={`${styles.card} ${styles.dangerZone}`}>
//                     <div className={styles.cardHeader}>
//                         <Server className={styles.cardIcon} size={20} />
//                         <h2>System Control</h2>
//                     </div>
//                     <div className={styles.cardContent}>
//                         {groups.system.map(([key, def]) => (
//                             <div key={key} className={styles.toggleRow}>
//                                 <div>
//                                     <label className={styles.toggleLabel}>{def.label}</label>
//                                     <p className={styles.helper}>{def.description}</p>
//                                 </div>
//                                 <label className={styles.switch}>
//                                     <input
//                                         type="checkbox"
//                                         name={key}
//                                         defaultChecked={initialValues[key] === 'true'}
//                                     />
//                                     <span className={`${styles.slider} ${styles.sliderRed}`}></span>
//                                 </label>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//             </div>

//             <div className={styles.actions}>
//                 <button type="submit" className={styles.saveBtn}>
//                     <Save size={18} />
//                     Save System Configuration
//                 </button>
//             </div>
//         </form>
//     );
// }