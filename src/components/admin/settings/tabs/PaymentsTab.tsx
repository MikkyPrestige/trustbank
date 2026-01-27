import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface PaymentsTabProps {
    settings: any;
    paymentsHeroUrl: string; setPaymentsHeroUrl: (url: string) => void;
    payBillsUrl: string; setPayBillsUrl: (url: string) => void;
    payP2PUrl: string; setPayP2PUrl: (url: string) => void;
    payWiresUrl: string; setPayWiresUrl: (url: string) => void;
}

export function PaymentsTab({ settings, paymentsHeroUrl, setPaymentsHeroUrl, payBillsUrl, setPayBillsUrl, payP2PUrl, setPayP2PUrl, payWiresUrl, setPayWiresUrl }: PaymentsTabProps) {
    return (
        <div className={styles.grid}>

            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}><h3 className={styles.sectionTitle}>Payments: Hero</h3></div>
            <div className={styles.group}><label className={styles.label}>Headline</label><input name="payments_hero_title" defaultValue={settings.payments_hero_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Highlight (Neon)</label><input name="payments_hero_highlight" defaultValue={settings.payments_hero_highlight} className={styles.input} /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><label className={styles.label}>Description</label><textarea name="payments_hero_desc" defaultValue={settings.payments_hero_desc} className={styles.textarea} /></div>

            <div className={styles.group}>
                <ImageUploader label="Hero Image" value={paymentsHeroUrl} onChange={setPaymentsHeroUrl} />
                <input type="hidden" name="payments_hero_img" value={paymentsHeroUrl} />
            </div>
            <div className={styles.group}><label className={styles.label}>Alt Text</label><input name="payments_hero_alt" defaultValue={settings.payments_hero_alt} className={styles.input} /></div>

            {/* --- WIDGET --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Transfer Widget</h3></div>
            <div className={styles.group}><label className={styles.label}>Widget Title</label><input name="payments_widget_title" defaultValue={settings.payments_widget_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Widget Subtitle</label><input name="payments_widget_desc" defaultValue={settings.payments_widget_desc} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Fee Label</label><input name="payments_widget_fee_label" defaultValue={settings.payments_widget_fee_label} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Fee Value</label><input name="payments_widget_fee_value" defaultValue={settings.payments_widget_fee_value} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Time Label</label><input name="payments_est_time_label" defaultValue={settings.payments_est_time_label} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Time Value</label><input name="payments_est_time_val" defaultValue={settings.payments_est_time_val} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Security Label</label><input name="payments_est_sec_label" defaultValue={settings.payments_est_sec_label} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Security Value</label><input name="payments_est_sec_val" defaultValue={settings.payments_est_sec_val} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Button Text</label><input name="payments_est_btn" defaultValue={settings.payments_est_btn} className={styles.input} /></div>

            {/* --- ANCHOR SECTIONS --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Anchor Sections</h3></div>

            {/* 1. Bill Pay */}
            <div className={styles.fullWidth}><strong>1. Bill Pay (#bills)</strong></div>
            <div className={styles.group}><input name="payments_bills_title" defaultValue={settings.payments_bills_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_bills_btn" defaultValue={settings.payments_bills_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={payBillsUrl} onChange={setPayBillsUrl} /><input type="hidden" name="payments_bills_img" value={payBillsUrl} /></div>
            <div className={styles.group}><input name="payments_bills_alt" defaultValue={settings.payments_bills_alt} className={styles.input} placeholder="Alt" /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="payments_bills_desc" defaultValue={settings.payments_bills_desc} className={styles.textarea} /></div>

            {/* 2. P2P */}
            <div className={styles.fullWidth}><strong>2. P2P (#p2p)</strong></div>
            <div className={styles.group}><input name="payments_p2p_title" defaultValue={settings.payments_p2p_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_p2p_btn" defaultValue={settings.payments_p2p_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={payP2PUrl} onChange={setPayP2PUrl} /><input type="hidden" name="payments_p2p_img" value={payP2PUrl} /></div>
            <div className={styles.group}><input name="payments_p2p_alt" defaultValue={settings.payments_p2p_alt} className={styles.input} placeholder="Alt" /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="payments_p2p_desc" defaultValue={settings.payments_p2p_desc} className={styles.textarea} /></div>

            {/* 3. Wires */}
            <div className={styles.fullWidth}><strong>3. Wires (#wires)</strong></div>
            <div className={styles.group}><input name="payments_wires_title" defaultValue={settings.payments_wires_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_wires_btn" defaultValue={settings.payments_wires_btn} className={styles.input} /></div>
            <div className={styles.group}><ImageUploader label="Image" value={payWiresUrl} onChange={setPayWiresUrl} /><input type="hidden" name="payments_wires_img" value={payWiresUrl} /></div>
            <div className={styles.group}><input name="payments_wires_alt" defaultValue={settings.payments_wires_alt} className={styles.input} placeholder="Alt" /></div>
            <div className={`${styles.group} ${styles.fullWidth}`}><textarea name="payments_wires_desc" defaultValue={settings.payments_wires_desc} className={styles.textarea} /></div>

            {/* --- SUPPLEMENTAL GRID --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Supplemental Grid</h3></div>
            <div className={styles.group}><label className={styles.label}>Title</label><input name="payments_supp_title" defaultValue={settings.payments_supp_title} className={styles.input} /></div>
            <div className={styles.group}><label className={styles.label}>Desc</label><input name="payments_supp_desc" defaultValue={settings.payments_supp_desc} className={styles.input} /></div>
            <div className={styles.fullWidth}><strong>Items</strong></div>
            <div className={styles.group}><input name="payments_supp1_title" defaultValue={settings.payments_supp1_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_supp1_desc" defaultValue={settings.payments_supp1_desc} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_supp2_title" defaultValue={settings.payments_supp2_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_supp2_desc" defaultValue={settings.payments_supp2_desc} className={styles.input} /></div>

            {/* --- UTILITY STRIP --- */}
            <div className={styles.fullWidth}><hr className={styles.divider} /><h3 className={styles.sectionTitle}>Utility Strip (Bottom)</h3></div>
            {/* Item 1 */}
            <div className={styles.fullWidth}><strong>1. Pay by Mail</strong></div>
            <div className={styles.group}><input name="payments_util1_title" defaultValue={settings.payments_util1_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_util1_desc" defaultValue={settings.payments_util1_desc} className={styles.input} /></div>
            {/* Item 2 */}
            <div className={styles.fullWidth}><strong>2. Pay at Branch</strong></div>
            <div className={styles.group}><input name="payments_util2_title" defaultValue={settings.payments_util2_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_util2_desc" defaultValue={settings.payments_util2_desc} className={styles.input} /></div>
            {/* Item 3 */}
            <div className={styles.fullWidth}><strong>3. Wire Instructions</strong></div>
            <div className={styles.group}><input name="payments_util3_title" defaultValue={settings.payments_util3_title} className={styles.input} /></div>
            <div className={styles.group}><input name="payments_util3_desc" defaultValue={settings.payments_util3_desc} className={styles.input} /></div>
        </div>
    );
}