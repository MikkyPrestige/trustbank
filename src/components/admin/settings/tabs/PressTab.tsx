import Link from "next/link";
import ImageUploader from "@/components/admin/media/ImageUploader";
import { Newspaper, ArrowRight } from "lucide-react";
import styles from "../settings.module.css";

interface PressTabProps {
    settings: any;
    pressHeroUrl: string;
    setPressHeroUrl: (url: string) => void;
}

export function PressTab({ settings, pressHeroUrl, setPressHeroUrl }: PressTabProps) {
    return (
        <div className={styles.grid}>
            {/* --- 1. DATA MANAGEMENT LINK --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Newsroom Database</h3>
                <p className={styles.sectionSubtitle}>Manage press releases and company announcements.</p>
            </div>

            <Link href="/admin/press" className={styles.navCard}>
                <div className={`${styles.navIcon} ${styles.iconPrimary}`}>
                    <Newspaper size={24} />
                </div>
                <div className={styles.navText}>
                    <h4 className={styles.navTitle}>Manage Press Releases</h4>
                    <p className={styles.navSubtitle}>Publish new stories or edit existing ones</p>
                </div>
                <ArrowRight size={16} className={styles.chevron} />
            </Link>

            {/* --- 2. PRESS PAGE CONFIG --- */}
            <div className={`${styles.fullWidth} ${styles.marginTop}`}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Press Page Configuration</h3>
                <p className={styles.sectionSubtitle}>Manage newsroom headers and media kits.</p>
            </div>

            <div className={styles.group}><label className={styles.label}>Hero Title</label><input name="press_hero_title" defaultValue={settings.press_hero_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Hero Description</label><input name="press_hero_desc" defaultValue={settings.press_hero_desc} className={styles.input} /></div>

            <div className={styles.group}>
                <ImageUploader label="Hero Image" value={pressHeroUrl} onChange={setPressHeroUrl} />
                <input type="hidden" name="press_hero_img" value={pressHeroUrl} />
            </div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="press_hero_img_alt" defaultValue={settings.press_hero_img_alt} className={styles.input} /></div>

            <div className={styles.group}><label className={styles.label}>Media Kit Title</label><input name="press_kit_title" defaultValue={settings.press_kit_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Media Kit Link</label><input name="press_kit_link" defaultValue={settings.press_kit_link} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Contact Email</label><input name="press_contact_email" defaultValue={settings.press_contact_email} className={styles.input} /></div>

            {/* Sidebar Widget */}
            <div className={styles.fullWidth}><h4 className={styles.subsectionTitle}>Sidebar &quot;About&quot; Widget</h4></div>
            <div className={styles.group}><label className={styles.label}>Widget Title</label><input name="press_about_title" defaultValue={settings.press_about_title} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Widget Description</label><textarea name="press_about_desc" defaultValue={settings.press_about_desc} className={styles.textarea} /></div>
        </div>
    );
}