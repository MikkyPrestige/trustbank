import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import styles from "../settings.module.css";

interface FaqTabProps {
    settings: any;
}

export function FaqTab({ settings }: FaqTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>FAQ</h3>
                <p className={styles.sectionSubtitle}>Manage the Questions & Answers displayed in the accordion.</p>
            </div>
            <Link href="/admin/faqs" className={styles.navCard}>
                <div className={`${styles.navIcon} ${styles.iconPrimary}`}>
                    <HelpCircle size={24} />
                </div>
                <div className={styles.navText}>
                    <h4 className={styles.navTitle}>Manage FAQs</h4>
                    <p className={styles.navSubtitle}>Add, edit, or remove questions</p>
                </div>
                <ArrowRight size={16} className={styles.chevron} />
            </Link>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>HERO SECTION</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="help_hero_title" defaultValue={settings.help_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="help_hero_desc" defaultValue={settings.help_hero_desc} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.sectionTitle}>Quick Action Cards</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Section Title</label>
                <input name="help_quick_title" defaultValue={settings.help_quick_title} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Action 1</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="help_action1_title" defaultValue={settings.help_action1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="help_action1_link" defaultValue={settings.help_action1_link} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="help_action1_desc" defaultValue={settings.help_action1_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>Action 2</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="help_action2_title" defaultValue={settings.help_action2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="help_action2_link" defaultValue={settings.help_action2_link} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="help_action2_desc" defaultValue={settings.help_action2_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>Action 3</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="help_action3_title" defaultValue={settings.help_action3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="help_action3_link" defaultValue={settings.help_action3_link} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="help_action3_desc" defaultValue={settings.help_action3_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>Action 4</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="help_action4_title" defaultValue={settings.help_action4_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="help_action4_link" defaultValue={settings.help_action4_link} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="help_action4_desc" defaultValue={settings.help_action4_desc} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.sectionTitle}>FAQ Section</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="help_faq_title" defaultValue={settings.help_faq_title} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.sectionTitle}>Contact Strip Section</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="help_contact_title" defaultValue={settings.help_contact_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="help_contact_desc" defaultValue={settings.help_contact_desc} className={styles.input} />
            </div>

            <div className={styles.group}>
                <label className={styles.label}>Phone Button Text</label>
                <input name="help_contact_btn1_text" defaultValue={settings.help_contact_btn1_text} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Chat Button Text</label>
                    <input name="help_contact_btn2_text" defaultValue={settings.help_contact_btn2_text} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Chat Link</label>
                    <input name="help_contact_btn2_link" defaultValue={settings.help_contact_btn2_link} className={styles.input} />
                </div>
            </div>
        </div>
    );
}