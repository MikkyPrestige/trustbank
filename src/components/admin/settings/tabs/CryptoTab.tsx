import { useState } from "react";
import ImageUploader from "@/components/admin/media/ImageUploader";
import { X } from "lucide-react";
import styles from "../settings.module.css";

interface ManagedAsset {
    id: string;
    name: string;
    symbol: string;
    api_id: string;
    type: 'CRYPTO' | 'STOCK';
    iconUrl: string;
    isActive: boolean;
}

export function CryptoTab({ settings, cryptoHeroUrl, setCryptoHeroUrl, initialManagedAssets = [] }: any) {
    const [assets, setAssets] = useState<ManagedAsset[]>(initialManagedAssets || []);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);

    const addAsset = (type: 'CRYPTO' | 'STOCK') => {
        const newAsset: ManagedAsset = {
            id: '',
            name: '',
            symbol: '',
            api_id: '',
            type: type,
            iconUrl: '',
            isActive: true
        };

        setAssets([...assets, newAsset]);
    };

    const removeAsset = (index: number) => {
        const assetToDelete = assets[index];
        if (!assetToDelete) return;

        if (assetToDelete.id) {
            setDeletedIds((prev) => [...prev, assetToDelete.id]);
        }
        setAssets(assets.filter((_asset: ManagedAsset, i: number) => i !== index));
    };

    return (
        <div className={styles.grid}>
            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>HERO SECTION</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Badge</label>
                <input name="crypto_hero_badge" defaultValue={settings.crypto_hero_badge} className={styles.input} />
            </div>
            <div className={styles.row}>
                <div className={styles.group}>
                    <label className={styles.label}>Headline</label>
                    <input name="crypto_hero_title" defaultValue={settings.crypto_hero_title} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Highlight</label>
                    <input name="crypto_hero_highlight" defaultValue={settings.crypto_hero_highlight} className={styles.input} />
                </div>
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="crypto_hero_desc" defaultValue={settings.crypto_hero_desc} className={styles.textarea} />
            </div>

            <div className={styles.group}>
                <ImageUploader label="Hero Image" value={cryptoHeroUrl} onChange={setCryptoHeroUrl} />
                <input type="hidden" name="crypto_hero_img" value={cryptoHeroUrl} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Image Alt Text</label>
                <textarea name="crypto_hero_alt" defaultValue={settings.crypto_hero_alt} className={styles.textarea} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Primary Button</label>
                <input name="crypto_hero_btn_primary" defaultValue={settings.crypto_hero_btn_primary} className={styles.input} placeholder="Start Trading" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Primary Button Link</label>
                <input name="crypto_hero_btn_primary_link" defaultValue={settings.crypto_hero_btn_primary_link} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Secondary Button</label>
                <input name="crypto_hero_btn_secondary" defaultValue={settings.crypto_hero_btn_secondary} className={styles.input} placeholder="Learn Crypto" />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Secondary Button Link</label>
                <input name="crypto_hero_btn_secondary_link" defaultValue={settings.crypto_hero_btn_secondary_link} className={styles.input} />
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Live Asset Configuration</h3>
            </div>
            <div className={styles.groupTable}>
                <div className={styles.table}>
                    <table className={styles.cryptoTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Icon</th>
                            <th>Symbol</th>
                            <th>API ID</th>
                            <th>Type</th>
                            <th>Active</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset: any, i: number) => (
                            <tr key={asset.id || i}>
                                <input type="hidden" name={`asset_id_${i}`} value={asset.id || ''} />
                                <input type="hidden" name={`asset_icon_url_${i}`} value={asset.iconUrl || ''} />
                                <input type="hidden" name="deleted_asset_ids" value={deletedIds.join(',')} />

                                <td>
                                    <input name={`asset_name_${i}`} defaultValue={asset.name} className={styles.input} placeholder="Asset" />
                                </td>
                                <td>
                                    <div className={styles.miniUploaderWrapper}>
                                        <ImageUploader
                                            value={asset.iconUrl}
                                            onChange={(url) => {
                                                const newAssets = [...assets];
                                                newAssets[i].iconUrl = url;
                                                setAssets(newAssets);
                                            }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <input name={`asset_symbol_${i}`} defaultValue={asset.symbol} className={styles.input} placeholder="BTC" />
                                    </div>
                                </td>
                                <td>
                                    <input name={`asset_api_id_${i}`} defaultValue={asset.api_id} className={styles.input} placeholder="ID" />
                                </td>
                                <td>
                                    <select name={`asset_type_${i}`} defaultValue={asset.type} className={styles.select}>
                                        <option value="CRYPTO">Crypto</option>
                                        <option value="STOCK">Stock</option>
                                    </select>
                                </td>
                                <td className={styles.activeCell}>
                                    <input type="checkbox" name={`asset_active_${i}`} defaultChecked={asset.isActive} className={styles.checkbox} />
                                </td>
                                <td>
                                    <button type="button" onClick={() => removeAsset(i)} className={styles.deleteBtn}><X size={20} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className={styles.buttonGroup}>
                    <button type="button" onClick={() => addAsset('CRYPTO')} className={styles.addBtn}>
                        + Add Crypto
                    </button>
                    <button type="button" onClick={() => addAsset('STOCK')} className={styles.addBtnStock}>
                        + Add Stock
                    </button>
                </div>
                </div>
            </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Market Table</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="crypto_table_title" defaultValue={settings.crypto_table_title} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>SubTitle</label>
                <input name="crypto_table_subtitle" defaultValue={settings.crypto_table_subtitle} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Table Heads</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>1</label>
                <input name="crypto_th1" defaultValue={settings.crypto_th1} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>2</label>
                <input name="crypto_th2" defaultValue={settings.crypto_th2} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>3</label>
                <input name="crypto_th3" defaultValue={settings.crypto_th3} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>4</label>
                <input name="crypto_th4" defaultValue={settings.crypto_th4} className={styles.input} />
            </div>
            <div className={styles.group}>
                <label className={styles.label}>5</label>
                <input name="crypto_th5" defaultValue={settings.crypto_th5} className={styles.input} />
            </div>

            <div className={styles.groupHeader}><strong>Table Body</strong></div>
                <div className={styles.group}>
                    <label className={styles.label}>Link</label>
                    <input name="crypto_tb_link" defaultValue={settings.crypto_tb_link} className={styles.input} />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>Link Text</label>
                    <input name="crypto_tb_link_text" defaultValue={settings.crypto_tb_link_text} className={styles.input} />
                </div>

            <div className={styles.fullWidth}>
                <hr className={styles.divider} />
                <h3 className={styles.sectionTitle}>Security Features</h3>
            </div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="crypto_sec_title" defaultValue={settings.crypto_sec_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="crypto_sec_desc" defaultValue={settings.crypto_sec_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>1. Cold Storage</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="crypto_feat1_title" defaultValue={settings.crypto_feat1_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="crypto_feat1_desc" defaultValue={settings.crypto_feat1_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>2. Insurance</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="crypto_feat2_title" defaultValue={settings.crypto_feat2_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="crypto_feat2_desc" defaultValue={settings.crypto_feat2_desc} className={styles.textarea} />
            </div>

            <div className={styles.groupHeader}><strong>3. Liquidity</strong></div>
            <div className={styles.group}>
                <label className={styles.label}>Title</label>
                <input name="crypto_feat3_title" defaultValue={settings.crypto_feat3_title} className={styles.input} />
            </div>
            <div className={`${styles.group} ${styles.fullWidth}`}>
                <label className={styles.label}>Description</label>
                <textarea name="crypto_feat3_desc" defaultValue={settings.crypto_feat3_desc} className={styles.textarea} />
            </div>
        </div >
    );
}