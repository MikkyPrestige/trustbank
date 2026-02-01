import {
    DEFAULT_PRIVACY,
    DEFAULT_TERMS,
    DEFAULT_ACCESSIBILITY
} from "@/lib/content/legal-defaults";
import styles from "../settings.module.css";

export function LegalTab({ settings }: { settings: any }) {
    const getInitialContent = (dbValue: string, placeholder: string, fullDefault: string) => {
        if (!dbValue || dbValue === placeholder) return fullDefault;
        return dbValue;
    };
    return (
        <div className={styles.grid}>
            <div className={`${styles.fullWidth} ${styles.warningBox}`}>
                <strong>Note:</strong> These fields accept HTML (e.g., &lt;h2&gt;, &lt;p&gt;). Be careful when editing.
            </div>

            {/* PRIVACY POLICY */}
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Privacy Policy</label>
                <textarea
                    name="legal_privacy_policy"
                    defaultValue={getInitialContent(
                        settings.legal_privacy_policy,
                        "<p>Privacy Policy content...</p>",
                        DEFAULT_PRIVACY
                    )}
                    className={`${styles.textarea} ${styles.legalEditor}`}
                />
            </div>

            {/* TERMS OF SERVICE */}
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Terms of Service</label>
                <textarea
                    name="legal_terms_service"
                    defaultValue={getInitialContent(
                        settings.legal_terms_service,
                        "<p>Terms of Service content...</p>",
                        DEFAULT_TERMS
                    )}
                    className={`${styles.textarea} ${styles.legalEditor}`}
                />
            </div>

            {/* ACCESSIBILITY */}
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Accessibility Statement</label>
                <textarea
                    name="legal_accessibility_statement"
                    defaultValue={getInitialContent(
                        settings.legal_accessibility_statement,
                        "<p>Accessibility content...</p>",
                        DEFAULT_ACCESSIBILITY
                    )}
                    className={`${styles.textarea} ${styles.legalEditor}`}
                />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Shared Layout Settings</h3>
                <p className={styles.sectionSubtitle}>Customize the footer and navigation for all legal pages.</p>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>&quot;Last Updated&quot; Label</label>
                <input
                    name="legal_updated_label"
                    defaultValue={settings.legal_updated_label}
                    className={styles.input}
                    placeholder="e.g. Effective Date:"
                />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Back Button Text</label>
                <input name="legal_back_text" defaultValue={settings.legal_back_text} className={styles.input} />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Footer Disclaimer Text</label>
                <input name="legal_footer_text" defaultValue={settings.legal_footer_text} className={styles.input} />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Footer Link Text</label>
                <input name="legal_link_text" defaultValue={settings.legal_link_text} className={styles.input} />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Footer Link URL</label>
                <input name="legal_link_url" defaultValue={settings.legal_link_url} className={styles.input} />
            </div>
        </div>
    );
}