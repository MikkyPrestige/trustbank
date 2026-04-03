import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";

interface BankingTabProps {
    settings: any;
    bankHeroUrl: string; setBankHeroUrl: (url: string) => void;
    bankCSUrl: string; setBankCSUrl: (url: string) => void;
    bankBizUrl: string; setBankBizUrl: (url: string) => void;
    bankStuUrl: string; setBankStuUrl: (url: string) => void;
}

export function BankingTab({
    settings,
    bankHeroUrl, setBankHeroUrl,
    bankCSUrl, setBankCSUrl,
    bankBizUrl, setBankBizUrl,
    bankStuUrl, setBankStuUrl
}: BankingTabProps) {
    return (
        <div className={styles.grid}>
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Bank Page</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Title</label>
                <input name="bank_hero_title_1" defaultValue={settings.bank_hero_title_1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Hero Highlight</label>
                <input name="bank_hero_highlight" defaultValue={settings.bank_hero_highlight} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Hero Description</label>
                <textarea name="bank_hero_desc" defaultValue={settings.bank_hero_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={bankHeroUrl} onChange={setBankHeroUrl} />
                <input type="hidden" name="bank_hero_img" value={bankHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="bank_hero_alt" defaultValue={settings.bank_hero_alt} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Card Feature List</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Card Badge</label>
                <input name="bank_card_badge" defaultValue={settings.bank_card_badge} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Card Title</label>
                <input name="bank_card_title" defaultValue={settings.bank_card_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_card_desc" defaultValue={settings.bank_card_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Feature 1</label>
                <input name="bank_card_feat_1" defaultValue={settings.bank_card_feat_1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Feature 2</label>
                <input name="bank_card_feat_2" defaultValue={settings.bank_card_feat_2} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Feature 3</label>
                <input name="bank_card_feat_3" defaultValue={settings.bank_card_feat_3} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>3D Card Visual</h3>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Bank Name</label>
                    <input name="card_bank_name" defaultValue={settings.site_name} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Card Holder Name</label>
                    <input name="card_holder_name" defaultValue={settings.bank_card_holder_name} className={styles.input} />
                </div>
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Last 4 Digits</label>
                    <input name="card_last_four" defaultValue={settings.bank_card_last_four} className={styles.input} maxLength={4} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Expiry Date (MM/YY)</label>
                    <input name="card_expiry" defaultValue={settings.bank_card_expiry} className={styles.input} />
                </div>
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Product Sections</h3>
            </div>
            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>1. Checking & Savings</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="bank_cs_title" defaultValue={settings.bank_cs_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_cs_desc" defaultValue={settings.bank_cs_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={bankCSUrl} onChange={setBankCSUrl} />
                <input type="hidden" name="bank_cs_img" value={bankCSUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="bank_cs_img_alt" defaultValue={settings.bank_cs_img_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Text</label>
                <input name="bank_cs_btn" defaultValue={settings.bank_cs_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="bank_cs_link" defaultValue={settings.bank_cs_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>2. Business Banking</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="bank_biz_title" defaultValue={settings.bank_biz_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_biz_desc" defaultValue={settings.bank_biz_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={bankBizUrl} onChange={setBankBizUrl} />
                <input type="hidden" name="bank_biz_img" value={bankBizUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="bank_biz_img_alt" defaultValue={settings.bank_biz_img_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Text</label>
                <input name="bank_biz_btn" defaultValue={settings.bank_biz_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="bank_biz_link" defaultValue={settings.bank_biz_link} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>3. Student Banking</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="bank_stu_title" defaultValue={settings.bank_stu_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_stu_desc" defaultValue={settings.bank_stu_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={bankStuUrl} onChange={setBankStuUrl} />
                <input type="hidden" name="bank_stu_img" value={bankStuUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="bank_stu_img_alt" defaultValue={settings.bank_stu_img_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Text</label>
                <input name="bank_stu_btn" defaultValue={settings.bank_stu_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="bank_stu_link" defaultValue={settings.bank_stu_link} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Features Section</h3>
            </div>
            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Feature 1</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="bank_feat_1_title" defaultValue={settings.bank_feat_1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_feat_1_desc" defaultValue={settings.bank_feat_1_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Feature 2</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="bank_feat_2_title" defaultValue={settings.bank_feat_2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_feat_2_desc" defaultValue={settings.bank_feat_2_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Feature 3</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="bank_feat_3_title" defaultValue={settings.bank_feat_3_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_feat_3_desc" defaultValue={settings.bank_feat_3_desc} className={styles.textarea} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Fee Comparison</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="bank_compare_title" defaultValue={settings.bank_compare_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="bank_compare_desc" defaultValue={settings.bank_compare_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Table</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Col 1 Header</label>
                <input name="bank_compare_col_1" defaultValue={settings.bank_compare_col_1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Col 2 Header</label>
                <input name="bank_compare_col_2" defaultValue={settings.bank_compare_col_2} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Row 1: Maintenance</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="bank_tbl_row_1_label" defaultValue={settings.bank_tbl_row_1_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Your Fee</label>
                    <input name="bank_fee_monthly" defaultValue={settings.bank_fee_monthly} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Competitor</label>
                    <input name="competitor_fee_monthly" defaultValue={settings.bank_competitor_fee_monthly} className={styles.input} />
                </div>
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Row 2: Overdraft</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="bank_tbl_row_2_label" defaultValue={settings.bank_tbl_row_2_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Your Fee</label>
                    <input name="bank_fee_overdraft" defaultValue={settings.bank_fee_overdraft} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Competitor</label>
                    <input name="competitor_fee_overdraft" defaultValue={settings.bank_competitor_fee_overdraft} className={styles.input} />
                </div>
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Row 3: Foreign Tx</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="bank_tbl_row_3_label" defaultValue={settings.bank_tbl_row_3_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Your Fee</label>
                    <input name="bank_fee_foreign" defaultValue={settings.bank_fee_foreign} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Competitor</label>
                    <input name="competitor_fee_foreign" defaultValue={settings.bank_competitor_fee_foreign} className={styles.input} />
                </div>
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Row 4: Min Balance</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="bank_tbl_row_4_label" defaultValue={settings.bank_tbl_row_4_label} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Your Req</label>
                    <input name="bank_min_balance" defaultValue={settings.bank_min_balance} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Competitor</label>
                    <input name="competitor_min_balance" defaultValue={settings.bank_competitor_min_balance} className={styles.input} />
                </div>
            </div>

            <div className={styles.groupHeader}><h4 className={styles.subsectionTitle}>Row 5: Direct Deposit</h4></div>
            <div className={styles.group}>
                <label className={styles.label}>Label</label>
                <input name="bank_tbl_row_5_label" defaultValue={settings.bank_tbl_row_5_label} className={styles.input} />
            </div>
        </div>
    );
}