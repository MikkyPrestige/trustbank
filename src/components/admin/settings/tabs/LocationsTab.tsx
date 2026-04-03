import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import styles from "../settings.module.css";

interface LocationsTabProps {
    settings: any;
}

export function LocationsTab({ settings }: LocationsTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Branch Data</h3>
                <p className={styles.sectionSubtitle}>Manage your physical locations database.</p>
            </div>
            <Link href="/admin/branches" className={styles.navCard}>
                <div className={`${styles.navIcon} ${styles.iconPrimary}`}>
                    <MapPin size={24} />
                </div>
                <div className={styles.navText}>
                    <h4 className={styles.navTitle}>Manage Branch List</h4>
                    <p className={styles.navSubtitle}>Add, edit, or remove locations</p>
                </div>
                <ArrowRight size={16} className={styles.chevron} />
            </Link>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>HERO SECTION</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="locations_hero_title" defaultValue={settings.locations_hero_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Search Placeholder</label>
                <input name="locations_search_placeholder" defaultValue={settings.locations_search_placeholder} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Labels & UI</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>&quot;Open Now&quot; Label</label>
                <input name="locations_open_label" defaultValue={settings.locations_open_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>ATM Tag</label>
                <input name="locations_tag_atm" defaultValue={settings.locations_tag_atm} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Drive-Thru Tag</label>
                <input name="locations_tag_drive_thru" defaultValue={settings.locations_tag_drive_thru} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Notary Tag</label>
                <input name="locations_tag_notary" defaultValue={settings.locations_tag_notary} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Directions Button</label>
                <input name="locations_directions_btn_text" defaultValue={settings.locations_directions_btn_text} className={styles.input} />
            </div>
        </div>
    );
}