import styles from "../settings.module.css";

export function LegalTab({ settings }: { settings: any }) {
    return (
        <div className={styles.grid}>
            <div className={`${styles.fullWidth} ${styles.warningBox}`}>
                <strong>Note:</strong> These fields accept HTML (e.g., &lt;h2&gt;, &lt;p&gt;). Be careful when editing.
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Privacy Policy</label>
                <textarea
                    name="legal_privacy_policy"
                    defaultValue={settings.legal_privacy_policy}
                    className={`${styles.textarea} ${styles.legalEditor}`}
                />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Terms of Service</label>
                <textarea
                    name="legal_terms_service"
                    defaultValue={settings.legal_terms_service}
                    className={`${styles.textarea} ${styles.legalEditor}`}
                />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Accessibility Statement</label>
                <textarea
                    name="legal_accessibility_statement"
                    defaultValue={settings.legal_accessibility_statement}
                    className={`${styles.textarea} ${styles.legalEditor}`}
                />
            </div>
        </div>
    );
}