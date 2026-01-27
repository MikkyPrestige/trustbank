import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface SecurityTabProps {
    settings: any;
    securityHeroUrl: string;
    setSecurityHeroUrl: (url: string) => void;
}

export function SecurityTab({ settings, securityHeroUrl, setSecurityHeroUrl }: SecurityTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Security Page Settings</h3>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input
                    name="security_hero_title"
                    defaultValue={settings.security_hero_title}
                    className={styles.input}
                />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea
                    name="security_hero_desc"
                    defaultValue={settings.security_hero_desc}
                    className={styles.textarea}
                />
            </div>
            <div className={styles.group}>
                <ImageUploader
                    label="Hero Background Image"
                    value={securityHeroUrl}
                    onChange={setSecurityHeroUrl}
                />
                <input type="hidden" name="security_hero_img" value={securityHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="security_hero_alt" defaultValue={settings.security_hero_alt} className={styles.input} placeholder="e.g. security hero image" />
            </div>

            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Feature Cards</h3></div>
            {/* Feature 1 */}
            <div className={styles.group}>
                <label className={styles.label}>Feature 1 Title</label>
                <input name="security_feat1_title" defaultValue={settings.security_feat1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Feature 1 Desc</label>
                <input name="security_feat1_desc" defaultValue={settings.security_feat1_desc} className={styles.input} />
            </div>
            {/* Feature 2 */}
            <div className={styles.group}>
                <label className={styles.label}>Feature 2 Title</label>
                <input name="security_feat2_title" defaultValue={settings.security_feat2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Feature 2 Desc</label>
                <input name="security_feat2_desc" defaultValue={settings.security_feat2_desc} className={styles.input} />
            </div>
            {/* Feature 3 */}
            <div className={styles.group}>
                <label className={styles.label}>Feature 3 Title</label>
                <input name="security_feat3_title" defaultValue={settings.security_feat3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Feature 3 Desc</label>
                <input name="security_feat3_desc" defaultValue={settings.security_feat3_desc} className={styles.input} />
            </div>

            {/* Fraud Section */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Fraud Alert Section</h3></div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="security_fraud_title" defaultValue={settings.security_fraud_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Warning Card Title</label>
                <input name="security_fraud_card_title" defaultValue={settings.security_fraud_card_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Warning Description</label>
                <textarea name="security_fraud_card_desc" defaultValue={settings.security_fraud_card_desc} className={styles.textarea} />
            </div>
        </div>
    );
}