import styles from "../settings.module.css";
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import FooterLinkManager from "@/components/admin/footer/FooterLinkManager";

interface FooterTabProps {
    settings: any;
    footerLinks: any[];
}

export function FooterTab({ settings, footerLinks }: FooterTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- LINK MANAGER --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Footer Links Manager</h3>
                <p className={styles.sectionSubtitle}>Add or remove links from the footer columns.</p>
                <FooterLinkManager initialLinks={footerLinks} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
            </div>

            {/* --- TEXT SETTINGS --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Footer Content</h3>
            </div>

            {/* Mission Statement */}
            <div className={styles.group}>
                <label className={styles.label}>Mission Title</label>
                <input name="footer_mission_title" defaultValue={settings.footer_mission_title} className={styles.input} />
            </div>

            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Mission Text</label>
                <textarea name="footer_mission_text" defaultValue={settings.footer_mission_text} className={styles.textarea} style={{ minHeight: '100px' }} />
            </div>

            {/* Column Titles */}
            <div className={styles.group}>
                <label className={styles.label}>Column 1 Header</label>
                <input name="footer_col1_title" defaultValue={settings.footer_col1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Column 2 Header</label>
                <input name="footer_col2_title" defaultValue={settings.footer_col2_title} className={styles.input} />
            </div>

            {/* Contact Strip Labels */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Contact Strip Labels</h3>
            </div>

            <div className={styles.group}><label className={styles.label}>Support Label</label><input name="footer_lbl_support" defaultValue={settings.footer_lbl_support} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Email Label</label><input name="footer_lbl_email" defaultValue={settings.footer_lbl_email} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Hours Label</label><input name="footer_lbl_hours" defaultValue={settings.footer_lbl_hours} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Hours Value</label><input name="footer_val_hours" defaultValue={settings.footer_val_hours} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Video Label</label><input name="footer_lbl_video" defaultValue={settings.footer_lbl_video} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Video Value</label><input name="footer_val_video" defaultValue={settings.footer_val_video} className={styles.input} /></div>

            {/* Static Labels */}
            <div className={styles.group}><label className={styles.label}>Headquarters Label</label><input name="footer_lbl_headquarters" defaultValue={settings.footer_lbl_headquarters} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Locate Btn Label</label><input name="footer_lbl_locate" defaultValue={settings.footer_lbl_locate} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Copyright Text</label><input name="footer_lbl_copyright" defaultValue={settings.footer_lbl_copyright} className={styles.input} /></div>

            {/* Badges */}
            <div className={styles.group}><label className={styles.label}>Badge 1</label><input name="footer_badge1" defaultValue={settings.footer_badge1} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Badge 2</label><input name="footer_badge2" defaultValue={settings.footer_badge2} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Badge 3</label><input name="footer_badge3" defaultValue={settings.footer_badge3} className={styles.input} /></div>

            {/* Social Media */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Social Media Links</h3>
            </div>
            <div className={styles.group}><label className={styles.label}><Facebook size={14} /> Facebook URL</label><input name="social_facebook" defaultValue={settings.social_facebook} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}><Twitter size={14} /> Twitter/X URL</label><input name="social_twitter" defaultValue={settings.social_twitter} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}><Linkedin size={14} /> LinkedIn URL</label><input name="social_linkedin" defaultValue={settings.social_linkedin} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}><Instagram size={14} /> Instagram URL</label><input name="social_instagram" defaultValue={settings.social_instagram} className={styles.input} /></div>
        </div>
    );
}