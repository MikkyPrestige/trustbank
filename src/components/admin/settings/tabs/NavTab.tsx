import { useState, useEffect } from "react";
import styles from "../settings.module.css";
import { Braces, AlertTriangle, CheckCircle2, Link as LinkIcon } from "lucide-react";

interface NavTabProps {
    settings: any;
    jsonMenu: string;
    setJsonMenu: (val: string) => void;
}

export function NavTab({ settings, jsonMenu, setJsonMenu }: NavTabProps) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            if (jsonMenu) {
                const parsed = JSON.parse(jsonMenu);
                setJsonMenu(JSON.stringify(parsed, null, 2));
            }
        } catch (e) { }
    }, [jsonMenu, setJsonMenu]);

    const handleFormat = () => {
        try {
            const parsed = JSON.parse(jsonMenu);
            setJsonMenu(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (e: any) {
            setError("Invalid JSON: " + e.message);
        }
    };

    const isOverridden = (key: string, field: 'title' | 'desc' | 'link') => {
        try {
            const parsed = JSON.parse(jsonMenu);
            const prefixMap: Record<string, string> = {
                'BANKING': 'nav_bank',
                'LENDING': 'nav_borrow',
                'WEALTH': 'nav_wealth',
                'INSURANCE': 'nav_insure',
                'RESOURCES': 'nav_learn'
            };

            const settingsKey = `${prefixMap[key]}_${field}`;
            const jsonValue = parsed[key]?.promo?.[field === 'link' ? 'href' : field];
            const settingsValue = settings[settingsKey];

            // It's overridden if the settings field has a value
            return !!settingsValue && settingsValue !== jsonValue;
        } catch (e) {
            return false;
        }
    };

    return (
        <div className={styles.grid}>
            {/* --- SECTION 1: TOP BAR UTILITY LINKS --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Top Utility Links</h3>
                <p className={styles.sectionSubtitle}>Manage the links at the very top of the header.</p>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link 1 Label</label>
                <input name="nav_rates_label" defaultValue={settings.nav_rates_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link 1 URL</label>
                <input name="nav_rates_link" defaultValue={settings.nav_rates_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link 2 Label</label>
                <input name="nav_locations_label" defaultValue={settings.nav_locations_label} className={styles.input} />
            </div>

            <div className={styles.fullWidth}><strong className={styles.sectionSubtitle}>Dashboard</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>label</label>
                <input name="nav_dashboard_label" defaultValue={settings.nav_dashboard_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="nav_dashboard_link" defaultValue={settings.nav_dashboard_link} className={styles.input} />
            </div>

            <div className={styles.fullWidth}><strong className={styles.sectionSubtitle}>Action</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Login</label>
                <input name="nav_login_label" defaultValue={settings.nav_login_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Register</label>
                <input name="nav_register_label" defaultValue={settings.nav_register_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Logout</label>
                <input name="nav_logout_label" defaultValue={settings.nav_logout_label} className={styles.input} />
            </div>

            <div className={styles.fullWidth}><hr className={styles.divider} /></div>

            {/* --- SECTION 2: STRUCTURE EDITOR (JSON) --- */}
            <div className={`${styles.fullWidth} ${styles.warningBox}`}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <AlertTriangle size={20} />
                    <div>
                        <strong>Advanced Structure Configuration</strong>
                        <p style={{ margin: '5px 0 0', fontSize: '0.9rem' }}>
                            Controls the dropdown columns and links. Use valid JSON format.
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
                {error ? (
                    <div className={styles.errorMsg}><AlertTriangle size={14} /> {error}</div>
                ) : (
                    <div className={styles.validMsg}><CheckCircle2 size={14} /> Valid JSON Syntax</div>
                )}
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Promo Card Content</h3>
                <p className={styles.sectionSubtitle}>Titles, descriptions, and destination links for the dropdown promos.</p>
            </div>

            {/* --- SECTION 3: PROMO CONTENT  --- */}
            {/* 1. BANKING */}
            <div className={styles.promoAdminGroup}>
                <div className={styles.promoHeader}>
                    <label className={styles.label}>Banking Promo</label>
                    {isOverridden('BANK', 'title') && (
                        <span className={styles.overrideBadge}>Overriding JSON</span>
                    )}
                </div>
                <input name="nav_bank_title" placeholder="Title" defaultValue={settings.nav_bank_title} className={styles.input} />
                <input name="nav_bank_desc" placeholder="Description" defaultValue={settings.nav_bank_desc} className={styles.input} />
                <input name="nav_bank_link" placeholder="Link" defaultValue={settings.nav_bank_link} className={styles.input} />
            </div>

            {/* 2. LENDING */}
            <div className={styles.promoAdminGroup}>
                <div className={styles.promoHeader}>
                    <label className={styles.label}>Lending Promo</label>
                    {isOverridden('BORROW', 'title') && (
                        <span className={styles.overrideBadge}>Overriding JSON</span>
                    )}
                </div>
                <input name="nav_borrow_title" placeholder="Title" defaultValue={settings.nav_borrow_title} className={styles.input} />
                <input name="nav_borrow_desc" placeholder="Description" defaultValue={settings.nav_borrow_desc} className={styles.input} />
                <input name="nav_borrow_link" placeholder="Link" defaultValue={settings.nav_borrow_link} className={styles.input} />
            </div>

            {/* 3. WEALTH */}
            <div className={styles.promoAdminGroup}>
                <div className={styles.promoHeader}>
                    <label className={styles.label}>Wealth Promo</label>
                    {isOverridden('WEALTH', 'title') && (
                        <span className={styles.overrideBadge}>Overriding JSON</span>
                    )}
                </div>
                <input name="nav_wealth_title" placeholder="Title" defaultValue={settings.nav_wealth_title} className={styles.input} />
                <input name="nav_wealth_desc" placeholder="Description" defaultValue={settings.nav_wealth_desc} className={styles.input} />
                <input name="nav_wealth_link" placeholder="Link" defaultValue={settings.nav_wealth_link} className={styles.input} />
            </div>

            {/* 4. INSURANCE */}
            <div className={styles.promoAdminGroup}>
                <div className={styles.promoHeader}>
                    <label className={styles.label}>Insurance Promo</label>
                    {isOverridden('INSURE', 'title') && (
                        <span className={styles.overrideBadge}>Overriding JSON</span>
                    )}
                </div>
                <input name="nav_insure_title" placeholder="Title" defaultValue={settings.nav_insure_title} className={styles.input} />
                <input name="nav_insure_desc" placeholder="Description" defaultValue={settings.nav_insure_desc} className={styles.input} />
                <input name="nav_insure_link" placeholder="Link" defaultValue={settings.nav_insure_link} className={styles.input} />
            </div>

            {/* 5. RESOURCES */}
            <div className={styles.promoAdminGroup}>
                <div className={styles.promoHeader}>
                    <label className={styles.label}>Resources Promo</label>
                    {isOverridden('RESOURCES', 'title') && (
                        <span className={styles.overrideBadge}>Overriding JSON</span>
                    )}
                </div>
                <input name="nav_learn_title" placeholder="Title" defaultValue={settings.nav_learn_title} className={styles.input} />
                <input name="nav_learn_desc" placeholder="Description" defaultValue={settings.nav_learn_desc} className={styles.input} />
                <input name="nav_learn_link" placeholder="Link" defaultValue={settings.nav_learn_link} className={styles.input} />
            </div>
        </div>
    );
}