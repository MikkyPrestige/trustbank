import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import styles from "../settings.module.css";

interface FaqTabProps {
    settings: any;
}

export function FaqTab({ settings }: FaqTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- 1. DATA MANAGEMENT LINK --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>FAQ Database</h3>
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

            {/* --- 2. HELP PAGE CONFIG --- */}
            <div className={`${styles.fullWidth} ${styles.marginTop}`}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Help Page Configuration</h3>
                <p className={styles.sectionSubtitle}>Customize the headers and action cards.</p>
            </div>

            {/* Hero Section */}
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="help_hero_title" defaultValue={settings.help_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Subtitle</label>
                <input name="help_hero_desc" defaultValue={settings.help_hero_desc} className={styles.input} />
            </div>

            {/* Quick Actions */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Quick Action Cards</h4>
            </div>

            {/* Card 1 */}
            <div className={styles.group}><label className={styles.label}>Action 1 Title</label><input name="help_action1_title" defaultValue={settings.help_action1_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Action 1 Desc</label><input name="help_action1_desc" defaultValue={settings.help_action1_desc} className={styles.input} /></div>

            {/* Card 2 */}
            <div className={styles.group}><label className={styles.label}>Action 2 Title</label><input name="help_action2_title" defaultValue={settings.help_action2_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Action 2 Desc</label><input name="help_action2_desc" defaultValue={settings.help_action2_desc} className={styles.input} /></div>

            {/* Card 3 */}
            <div className={styles.group}><label className={styles.label}>Action 3 Title</label><input name="help_action3_title" defaultValue={settings.help_action3_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Action 3 Desc</label><input name="help_action3_desc" defaultValue={settings.help_action3_desc} className={styles.input} /></div>

            {/* Card 4 */}
            <div className={styles.group}><label className={styles.label}>Action 4 Title</label><input name="help_action4_title" defaultValue={settings.help_action4_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Action 4 Desc</label><input name="help_action4_desc" defaultValue={settings.help_action4_desc} className={styles.input} /></div>

            {/* Bottom CTA */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Bottom Contact Strip</h4>
            </div>
            <div className={styles.group}><label className={styles.label}>Strip Title</label><input name="help_cta_title" defaultValue={settings.help_cta_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Strip Description</label><input name="help_cta_desc" defaultValue={settings.help_cta_desc} className={styles.input} /></div>
        </div>
    );
}