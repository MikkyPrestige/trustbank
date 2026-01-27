import { useState, useEffect } from "react";
import styles from "../settings.module.css";
import { Braces, AlertTriangle, CheckCircle2 } from "lucide-react";

interface NavTabProps {
    settings: any;
    jsonMenu: string;
    setJsonMenu: (val: string) => void;
}

export function NavTab({ settings, jsonMenu, setJsonMenu }: NavTabProps) {
    const [error, setError] = useState<string | null>(null);

    // Auto-format on mount (optional, nice for UX)
    useEffect(() => {
        try {
            if (jsonMenu) {
                const parsed = JSON.parse(jsonMenu);
                setJsonMenu(JSON.stringify(parsed, null, 2));
            }
        } catch (e) {
        }
    }, [jsonMenu, setJsonMenu]);

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(jsonMenu);
            setJsonMenu(JSON.stringify(parsed, null, 2)); // Indent with 2 spaces
            setError(null);
        } catch (e: any) {
            setError("Invalid JSON: " + e.message);
        }
    };

    return (
        <div className={styles.grid}>
            {/* --- SECTION 1: STRUCTURE EDITOR (JSON) --- */}
            <div className={`${styles.fullWidth} ${styles.warningBox}`}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <AlertTriangle size={20} />
                    <div>
                        <strong>Advanced Configuration</strong>
                        <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
                            This controls the menu structure. Click &quot;Prettify&quot; to format the text vertically.
                        </p>
                    </div>
                </div>
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <div className={styles.editorToolbar}>
                    <label className={styles.label}>Navigation Structure (JSON)</label>
                    <button type="button" onClick={handleFormat} className={styles.formatBtn}>
                        <Braces size={14} /> Prettify JSON
                    </button>
                </div>

                <textarea
                    name="nav_structure_json"
                    value={jsonMenu}
                    onChange={(e) => {
                        setJsonMenu(e.target.value);
                        setError(null);
                    }}
                    className={`${styles.textarea} ${styles.jsonEditor} ${error ? styles.inputError : ''}`}
                    spellCheck={false}
                />

                {error && (
                    <div className={styles.errorMsg}>
                        <AlertTriangle size={14} /> {error}
                    </div>
                )}

                {!error && (
                    <div className={styles.validMsg}>
                        <CheckCircle2 size={14} /> Valid JSON Syntax
                    </div>
                )}
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Promo Content Overrides</h3>
                <p className={styles.sectionSubtitle}>
                    These texts appear in the highlighted box inside each mega menu.
                </p>
            </div>

            {/* --- SECTION 2: PROMO TEXTS (Keep existing inputs below) --- */}
            {/* 1. BANKING */}
            <div className={styles.group}>
                <label className={styles.label}>Banking Title</label>
                <input name="nav_bank_title" defaultValue={settings.nav_bank_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Banking Desc</label>
                <input name="nav_bank_desc" defaultValue={settings.nav_bank_desc} className={styles.input} />
            </div>

            {/* 2. SAVINGS */}
            <div className={styles.group}>
                <label className={styles.label}>Savings Title</label>
                <input name="nav_save_title" defaultValue={settings.nav_save_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Savings Desc</label>
                <input name="nav_save_desc" defaultValue={settings.nav_save_desc} className={styles.input} />
            </div>

            {/* 3. LENDING */}
            <div className={styles.group}>
                <label className={styles.label}>Lending Title</label>
                <input name="nav_borrow_title" defaultValue={settings.nav_borrow_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Lending Desc</label>
                <input name="nav_borrow_desc" defaultValue={settings.nav_borrow_desc} className={styles.input} />
            </div>

            {/* 4. WEALTH */}
            <div className={styles.group}>
                <label className={styles.label}>Wealth Title</label>
                <input name="nav_wealth_title" defaultValue={settings.nav_wealth_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Wealth Desc</label>
                <input name="nav_wealth_desc" defaultValue={settings.nav_wealth_desc} className={styles.input} />
            </div>

            {/* 5. INSURANCE */}
            <div className={styles.group}>
                <label className={styles.label}>Insurance Title</label>
                <input name="nav_insure_title" defaultValue={settings.nav_insure_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Insurance Desc</label>
                <input name="nav_insure_desc" defaultValue={settings.nav_insure_desc} className={styles.input} />
            </div>

            {/* 6. PAYMENTS */}
            <div className={styles.group}>
                <label className={styles.label}>Payments Title</label>
                <input name="nav_payments_title" defaultValue={settings.nav_payments_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Payments Desc</label>
                <input name="nav_payments_desc" defaultValue={settings.nav_payments_desc} className={styles.input} />
            </div>

            {/* 7. LEARN */}
            <div className={styles.group}>
                <label className={styles.label}>Learn Title</label>
                <input name="nav_learn_title" defaultValue={settings.nav_learn_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Learn Desc</label>
                <input name="nav_learn_desc" defaultValue={settings.nav_learn_desc} className={styles.input} />
            </div>

            {/* 8. COMPANY */}
            <div className={styles.group}>
                <label className={styles.label}>Company Title</label>
                <input name="nav_company_title" defaultValue={settings.nav_company_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Company Desc</label>
                <input name="nav_company_desc" defaultValue={settings.nav_company_desc} className={styles.input} />
            </div>
        </div>
    );
}