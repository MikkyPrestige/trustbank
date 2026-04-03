import styles from "../settings.module.css";

interface DashboardTabProps {
    settings: any;
}

export function DashboardTab({ settings }: DashboardTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Dashboard Alert</h3>
            </div>
            <div className={`${styles.group} ${styles.toggleWrapper}`}>
                <input type="hidden" name="dashboard_alert_show" value="false" />
                <input
                    type="checkbox"
                    name="dashboard_alert_show"
                    value='true'
                    defaultChecked={settings.dashboard_alert_show}
                    className={styles.checkbox}
                />
                <label className={styles.toggleLabel}>Show Dashboard Alert?</label>
            </div>
            <div className={styles.group}>
                <label className={`${styles.label} ${styles.alert}`}>Alert Type</label>
                <p className={styles.subLabel}>Use either &apos;info&apos;, &apos;warning&apos;, or &apos;error&apos;</p>
                <input name="dashboard_alert_type" defaultValue={settings.dashboard_alert_type} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Alert Message</label>
                <textarea name="dashboard_alert_msg" defaultValue={settings.dashboard_alert_msg} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Phone</label>
                <input name="dashboard_support_phone" defaultValue={settings.dashboard_support_phone} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Email</label>
                <input name="dashboard_support_email" defaultValue={settings.dashboard_support_email} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Promo</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="dashboard_promo_title" defaultValue={settings.dashboard_promo_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="dashboard_promo_desc" defaultValue={settings.dashboard_promo_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Rate</label>
                <input name="dashboard_promo_rate" defaultValue={settings.dashboard_promo_rate} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>ID</label>
                <input name="dashboard_promo_id" defaultValue={settings.dashboard_promo_id} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="dashboard_promo_btn" defaultValue={settings.dashboard_promo_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input name="dashboard_promo_link" defaultValue={settings.dashboard_promo_link} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Sidebar Footer</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Security</label>
                <input name="dashboard_sidebar_security_msg" defaultValue={settings.dashboard_sidebar_security_msg} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Support</label>
                <input name="dashboard_sidebar_support_msg" defaultValue={settings.dashboard_sidebar_support_msg} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Resources</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="dashboard_sidebar_res_title" defaultValue={settings.dashboard_sidebar_res_title} className={styles.input} />
            </div>
            <div className={styles.groupHeader}></div>
            <div className={styles.group}>
                <label className={styles.label}>Label 1</label>
                <input name="dashboard_sidebar_res_label1" defaultValue={settings.dashboard_sidebar_res_label1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link 1</label>
                <input name="dashboard_sidebar_res_link1" defaultValue={settings.dashboard_sidebar_res_link1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Label 2</label>
                <input name="dashboard_sidebar_res_label2" defaultValue={settings.dashboard_sidebar_res_label2} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link 2</label>
                <input name="dashboard_sidebar_res_link2" defaultValue={settings.dashboard_sidebar_res_link2} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Label 3</label>
                <input name="dashboard_sidebar_res_label3" defaultValue={settings.dashboard_sidebar_res_label3} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link 3</label>
                <input name="dashboard_sidebar_res_link3" defaultValue={settings.dashboard_sidebar_res_link3} className={styles.input} />
            </div>
        </div >
    );
}