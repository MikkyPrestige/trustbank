import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface SupportTabProps {
    settings: any;
    supportHeroUrl: string;
    setSupportHeroUrl: (url: string) => void;
}

export function SupportTab({ settings, supportHeroUrl, setSupportHeroUrl }: SupportTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Contact Page Settings</h3>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="support_hero_title" defaultValue={settings.support_hero_title} className={styles.input} />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="support_hero_desc" defaultValue={settings.support_hero_desc} className={styles.textarea} />
            </div>

            <div className={styles.group}>
                <ImageUploader
                    label="Hero Background Image"
                    value={supportHeroUrl}
                    onChange={setSupportHeroUrl}
                />
                <input type="hidden" name="support_hero_img" value={supportHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="support_hero_alt" defaultValue={settings.support_hero_alt} className={styles.input} placeholder="e.g. support hero image" />
            </div>

            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Contact Details</h3></div>

            <div className={styles.group}>
                <label className={styles.label}>Phone Title</label>
                <input name="support_phone_title" defaultValue={settings.support_phone_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Phone Number</label>
                <input name="support_phone" defaultValue={settings.support_phone} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Support Hours</label>
                <input name="support_hours" defaultValue={settings.support_hours} className={styles.input} />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Email Title</label>
                <input name="support_email_title" defaultValue={settings.support_email_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Email Address</label>
                <input name="support_email" defaultValue={settings.support_email} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Email Subtext</label>
                <input name="support_email_desc" defaultValue={settings.support_email_desc} className={styles.input} placeholder="e.g. Response within 24hrs" />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Address Title</label>
                <input name="support_address_title" defaultValue={settings.support_address_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Physical Address</label>
                <input name="support_address" defaultValue={settings.support_address} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Address Label</label>
                <input name="support_address_label" defaultValue={settings.support_address_label} className={styles.input} placeholder="e.g. Headquarters" />
            </div>

            {/* FAQ SECTION */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>FAQ Section</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="support_faq_title" defaultValue={settings.support_faq_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="support_faq_desc" defaultValue={settings.support_faq_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="support_faq_link" defaultValue={settings.support_faq_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="support_faq_linkText" defaultValue={settings.support_faq_linkText} className={styles.input} />
            </div>
        </div >
    );
}