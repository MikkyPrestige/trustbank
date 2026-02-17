import Link from "next/link";
import ImageUploader from "@/components/admin/media/ImageUploader";
import { Briefcase, ArrowRight } from "lucide-react";
import styles from "../settings.module.css";

interface JobsTabProps {
    settings: any;
    careersHeroUrl: string;
    setCareersHeroUrl: (url: string) => void;
}

export function JobsTab({ settings, careersHeroUrl, setCareersHeroUrl }: JobsTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- 1. DATA MANAGEMENT LINK --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Job Board Database</h3>
                <p className={styles.sectionSubtitle}>Manage open positions and applications.</p>
            </div>

            <Link href="/admin/careers" className={styles.navCard}>
                <div className={`${styles.navIcon} ${styles.iconPrimary}`}>
                    <Briefcase size={24} />
                </div>
                <div className={styles.navText}>
                    <h4 className={styles.navTitle}>Manage Careers</h4>
                    <p className={styles.navSubtitle}>Post new jobs or view applicants</p>
                </div>
                <ArrowRight size={16} className={styles.chevron} />
            </Link>

            {/* --- 2. CAREERS PAGE CONFIG --- */}
            <div className={`${styles.fullWidth} ${styles.marginTop}`}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Careers Page Configuration</h3>
            </div>

            {/* Hero */}
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="careers_hero_title" defaultValue={settings.careers_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="careers_hero_desc" defaultValue={settings.careers_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={careersHeroUrl} onChange={setCareersHeroUrl} />
                <input type="hidden" name="careers_hero_img" value={careersHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="careers_hero_img_alt" defaultValue={settings.careers_hero_img_alt} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Button Text</label>
                <input name="careers_hero_btn_text" defaultValue={settings.careers_hero_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Button Link</label>
                <input name="careers_hero_btn_link" defaultValue={settings.careers_hero_btn_link} className={styles.input} />
            </div>

            {/* Values */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Company Values</h4>
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <div className={styles.row}>
                    <div className={styles.group}>
                        <label className={styles.label}>Section Title</label>
                        <input name="careers_values_title" defaultValue={settings.careers_values_title} className={styles.input} />
                    </div>
                    <div className={styles.group}>
                        <label className={styles.label}>Mark</label>
                        <input name="careers_values_mark" defaultValue={settings.careers_values_mark} className={styles.input} />
                    </div>
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Section Subtitle</label>
                    <input name="careers_values_subtitle" defaultValue={settings.careers_values_subtitle} className={styles.input} />
                </div>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 1</label>
                <input name="careers_val1_title" defaultValue={settings.careers_val1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description 1</label>
                <textarea name="careers_val1_desc" defaultValue={settings.careers_val1_desc} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 2</label>
                <input name="careers_val2_title" defaultValue={settings.careers_val2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description 2</label>
                <textarea name="careers_val2_desc" defaultValue={settings.careers_val2_desc} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Value 3</label>
                <input name="careers_val3_title" defaultValue={settings.careers_val3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description 3</label>
                <textarea name="careers_val3_desc" defaultValue={settings.careers_val3_desc} className={styles.input} />
            </div>

            {/* Job Board Labels */}
            <div className={styles.fullWidth}>
                <h4 className={styles.subsectionTitle}>Job Board Interface</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Board Title</label>
                <input name="careers_jobs_title" defaultValue={settings.careers_jobs_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>&quot;No Roles&quot; Message</label>
                <textarea name="careers_jobs_no_roles" defaultValue={settings.careers_jobs_no_roles} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Jobs Button Text</label>
                <input name="careers_jobs_btn_text" defaultValue={settings.careers_jobs_btn_text} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Email Prompt</label>
                <input name="careers_jobs_email_text" defaultValue={settings.careers_jobs_email_text} className={styles.input} />
            </div>
        </div>
    );
}