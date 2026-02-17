import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import { createCurrency, deleteCurrency, updateCurrencyRate } from '@/actions/admin/currency';
import ImageUploader from "@/components/admin/media/ImageUploader";
import styles from "../settings.module.css";
import { toast } from 'react-hot-toast';

interface PaymentsTabProps {
    settings: any;
    currencies: any[];
    paymentsHeroUrl: string; setPaymentsHeroUrl: (url: string) => void;
    payBillsUrl: string; setPayBillsUrl: (url: string) => void;
    payP2PUrl: string; setPayP2PUrl: (url: string) => void;
    payWiresUrl: string; setPayWiresUrl: (url: string) => void;
}
export function PaymentsTab({ settings, currencies, paymentsHeroUrl, setPaymentsHeroUrl, payBillsUrl, setPayBillsUrl, payP2PUrl, setPayP2PUrl, payWiresUrl, setPayWiresUrl }: PaymentsTabProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [newCurrency, setNewCurrency] = useState({ flag: '', code: '', rate: '' });

    const handleRateBlur = async (id: string, value: string) => {
        const rate = parseFloat(value);
        if (isNaN(rate)) {
            toast.error("Please enter a valid number");
            return;
        }

        const res = await updateCurrencyRate(id, rate);
        if (res.success) {
            toast.success("Rate updated");
            router.refresh();
        } else {
            toast.error(res.message || "Update failed");
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Are you sure you want to remove ${code}?`)) return;

        startTransition(async () => {
            const res = await deleteCurrency(id);
            if (res.success) {
                toast.success(res.message);
                router.refresh();
            } else {
                toast.error(res.message);
            }
        });
    };

    return (
        <div className={styles.grid}>
            {/* --- HERO SECTION --- */}
            <div className={styles.fullWidth}>
                <h3 className={styles.sectionTitle}>Payments: Hero</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Badge</label>
                <input name="payments_hero_badge" defaultValue={settings.payments_hero_badge} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Headline</label>
                    <input name="payments_hero_title" defaultValue={settings.payments_hero_title} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Highlight</label>
                    <input name="payments_hero_highlight" defaultValue={settings.payments_hero_highlight} className={styles.input} />
                </div>
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_hero_desc" defaultValue={settings.payments_hero_desc} className={styles.textarea} />
            </div>

            <div className={styles.group}>
                <ImageUploader label="Hero Background Image" value={paymentsHeroUrl} onChange={setPaymentsHeroUrl} />
                <input type="hidden" name="payments_hero_img" value={paymentsHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="payments_hero_alt" defaultValue={settings.payments_hero_alt} className={styles.input} />
            </div>

            {/* --- WIDGET --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Transfer Estimator Widget</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_widget_title" defaultValue={settings.payments_widget_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Subtitle</label>
                <input name="payments_widget_desc" defaultValue={settings.payments_widget_desc} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Fee Label</label>
                    <input name="payments_widget_fee_label" defaultValue={settings.payments_widget_fee_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Fee Value</label>
                    <input name="payments_widget_fee_value" defaultValue={settings.payments_widget_fee_value} className={styles.input} />
                </div>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Delivery Speed Text</label>
                <input name="payments_est_time_val" defaultValue={settings.payments_est_time_val} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Time Label</label>
                <input name="payments_est_time_label" defaultValue={settings.payments_est_time_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Security Label</label>
                <input name="payments_est_sec_label" defaultValue={settings.payments_est_sec_label} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Security Value</label>
                <input name="payments_est_sec_val" defaultValue={settings.payments_est_sec_val} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="payments_est_btn" defaultValue={settings.payments_est_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Link</label>
                <input
                    name="payments_est_link"
                    defaultValue={settings.payments_est_link}
                    className={styles.input}
                    placeholder="/dashboard/wire"
                />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Input Label</label>
                    <input name="payments_est_input_label" defaultValue={settings.payments_est_input_label} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Output Label</label>
                    <input name="payments_est_output_label" defaultValue={settings.payments_est_output_label} className={styles.input} />
                </div>
            </div>

            <div className={styles.fullWidth}>
                <h3 className={styles.subsectionTitle}>Currency & Rates Management</h3>
                <p className={styles.subtitle}>Manage the exchange rates relative to 1 USD.</p>
            </div>
            <div className={`${styles.fullWidth} ${styles.currencyContainer}`}>
                {/* 1. List of existing currencies */}
                <div className={styles.fullWidth}>
                    <div className={styles.currencyList}>
                        {currencies?.length > 0 ? (
                            currencies.map((curr) => (
                                <div key={curr.id} className={styles.currencyRow}>
                                    <div className={styles.currencyInfo}>
                                        <span className={styles.flag}>{curr.flag}</span>
                                        <span className={styles.code}>{curr.code}</span>
                                    </div>
                                    <div className={styles.rateInputWrapper}>
                                        <label className={styles.miniLabel}>Rate (1 USD =)</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            defaultValue={curr.rate}
                                            onBlur={(e) => handleRateBlur(curr.id, e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(curr.id, curr.code)}
                                        className={styles.deleteBtn}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className={styles.emptyState}>No currencies added yet.</p>
                        )}
                    </div>
                    {/* 2. Add New Currency Form */}
                    <div className={styles.addCurrencyForm}>
                        <h4 className={styles.sectionSubtitle}>ADD NEW CURRENCY</h4>
                        <div className={styles.inlineForm}>
                            <div className={styles.inputGroupMini}>
                                <label className={styles.label}>Flag</label>
                                <input
                                    value={newCurrency.flag}
                                    onChange={(e) => setNewCurrency({ ...newCurrency, flag: e.target.value })}
                                    placeholder="🇯🇵"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroupMini}>
                                <label className={styles.label}>Code</label>
                                <input
                                    value={newCurrency.code}
                                    onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value })}
                                    placeholder="JPY"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroupMax}>
                                <label className={styles.label}>Exchange Rate</label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    value={newCurrency.rate}
                                    onChange={(e) => setNewCurrency({ ...newCurrency, rate: e.target.value })}
                                    placeholder="0.0011"
                                    className={styles.input}
                                />
                            </div>
                            <button
                                type="button"
                                className={styles.addBtn}
                                disabled={isPending || !newCurrency.code || !newCurrency.rate}
                                onClick={async () => {
                                    const formData = new FormData();
                                    formData.append('flag', newCurrency.flag);
                                    formData.append('code', newCurrency.code);
                                    formData.append('rate', newCurrency.rate);

                                    startTransition(async () => {
                                        const res = await createCurrency(formData);
                                        if (res.success) {
                                            toast.success(res.message);
                                            setNewCurrency({ flag: '', code: '', rate: '' });
                                            router.refresh();
                                        } else {
                                            toast.error(res.message);
                                        }
                                    });
                                }}
                            >
                                {isPending ? '...' : 'Add'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- ANCHOR SECTIONS --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Anchor Sections</h3>
            </div>
            {/* 1. Bill Pay */}
            <div className={styles.fullWidth}><strong>1. Bill Pay</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_bills_title" defaultValue={settings.payments_bills_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_bills_desc" defaultValue={settings.payments_bills_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="payments_bills_btn" defaultValue={settings.payments_bills_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="payments_bills_link" defaultValue={settings.payments_bills_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={payBillsUrl} onChange={setPayBillsUrl} />
                <input type="hidden" name="payments_bills_img" value={payBillsUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="payments_bills_alt" defaultValue={settings.payments_bills_alt} className={styles.input} placeholder="Alt" />
            </div>
            {/* P2P */}
            <div className={styles.fullWidth}><strong>2. P2P </strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_p2p_title" defaultValue={settings.payments_p2p_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_p2p_desc" defaultValue={settings.payments_p2p_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="payments_p2p_btn" defaultValue={settings.payments_p2p_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="payments_p2p_link" defaultValue={settings.payments_p2p_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={payP2PUrl} onChange={setPayP2PUrl} />
                <input type="hidden" name="payments_p2p_img" value={payP2PUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="payments_p2p_alt" defaultValue={settings.payments_p2p_alt} className={styles.input} placeholder="Alt" />
            </div>
            {/* Wires */}
            <div className={styles.fullWidth}><strong>3. Wires </strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_wires_title" defaultValue={settings.payments_wires_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_wires_desc" defaultValue={settings.payments_wires_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Button Text</label>
                <input name="payments_wires_btn" defaultValue={settings.payments_wires_btn} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="payments_wires_link" defaultValue={settings.payments_wires_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <ImageUploader label="Section Image" value={payWiresUrl} onChange={setPayWiresUrl} />
                <input type="hidden" name="payments_wires_img" value={payWiresUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <input name="payments_wires_alt" defaultValue={settings.payments_wires_alt} className={styles.input} placeholder="Alt" />
            </div>

            {/* --- SUPPLEMENTAL GRID --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Supplemental Grid</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_supp_title" defaultValue={settings.payments_supp_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_supp_desc" defaultValue={settings.payments_supp_desc} className={styles.textarea} />
            </div>
            <div className={styles.fullWidth}><strong>Items</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_supp1_title" defaultValue={settings.payments_supp1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="payments_supp1_link" defaultValue={settings.payments_supp1_link} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_supp1_desc" defaultValue={settings.payments_supp1_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_supp2_title" defaultValue={settings.payments_supp2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Anchor Link</label>
                <input name="payments_supp2_link" defaultValue={settings.payments_supp2_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_supp2_desc" defaultValue={settings.payments_supp2_desc} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Link Text</label>
                <input name="payments_supp_linkText" defaultValue={settings.payments_supp_linkText} className={styles.input} />
            </div>

            {/* --- UTILITY STRIP --- */}
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Utility Strip</h3>
            </div>
            {/* Item 1 */}
            <div className={styles.fullWidth}><strong>1. Pay by Mail</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_util1_title" defaultValue={settings.payments_util1_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_util1_desc" defaultValue={settings.payments_util1_desc} className={styles.textarea} />
            </div>
            {/* Item 2 */}
            <div className={styles.fullWidth}><strong>2. Pay at Branch</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_util2_title" defaultValue={settings.payments_util2_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_util2_desc" defaultValue={settings.payments_util2_desc} className={styles.textarea} />
            </div>
            {/* Item 3 */}
            <div className={styles.fullWidth}><strong>3. Wire Instructions</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="payments_util3_title" defaultValue={settings.payments_util3_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Description</label>
                <textarea name="payments_util3_desc" defaultValue={settings.payments_util3_desc} className={styles.textarea} />
            </div>
        </div >
    );
}