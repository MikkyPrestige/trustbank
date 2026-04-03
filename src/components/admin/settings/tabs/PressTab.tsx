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
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Newsroom</h3>
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

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>HERO SECTION</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="press_hero_title" defaultValue={settings.press_hero_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="press_hero_desc" defaultValue={settings.press_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Press Contact</label>
                <input name="press_contact" defaultValue={settings.press_contact} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Contact Email</label>
                <input name="press_contact_email" defaultValue={settings.press_contact_email} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={pressHeroUrl} onChange={setPressHeroUrl} />
                <input type="hidden" name="press_hero_img" value={pressHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="press_hero_img_alt" defaultValue={settings.press_hero_img_alt} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.sectionTitle}>Press Release</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="press_release_title" defaultValue={settings.press_release_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link Text</label>
                <input name="press_read_more_text" defaultValue={settings.press_read_more_text} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Empty State</label>
                <textarea name="press_empty_state" defaultValue={settings.press_empty_state} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.sectionTitle}>Media Kits</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="press_kit_title" defaultValue={settings.press_kit_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="press_kit_desc" defaultValue={settings.press_kit_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>File Icon</label>
                <input name="press_file_icon" defaultValue={settings.press_file_icon} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link</label>
                <input name="press_kit_link" defaultValue={settings.press_kit_link} className={styles.input} />
            </div>
            <div className={styles.row}>
            <div className={styles.group}>
                <label className={styles.label}>File Name</label>
                <input name="press_file_name" defaultValue={settings.press_file_name} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>File Size</label>
                <input name="press_file_size" defaultValue={settings.press_file_size} className={styles.input} />
            </div>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="press_download_btn_text" defaultValue={settings.press_download_btn_text} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <h4 className={styles.sectionTitle}>Sidebar &quot;About&quot;</h4>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="press_about_title" defaultValue={settings.press_about_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="press_about_desc" defaultValue={settings.press_about_desc} className={styles.textarea} />
            </div>
        </div>
    );
}