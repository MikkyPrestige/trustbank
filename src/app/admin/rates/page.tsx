import { getExchangeRates, refreshLiveRates, updateManualRate } from "@/actions/admin/currency";
import { RefreshCw, TrendingUp, Save } from "lucide-react";
import styles from "./rates.module.css";
import { requireAdmin } from "@/lib/auth/admin-auth";

export default async function AdminRatesPage() {
  await requireAdmin();

    const { data: rates } = await getExchangeRates();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Exchange Rates</h1>
                    <p className={styles.subtitle}>Manage global currency conversion rates (Base: USD).</p>
                </div>

                <form
                    action={async () => {
                        "use server";
                        await refreshLiveRates();
                    }}
                >
                    <button type="submit" className={styles.refreshBtn}>
                        <RefreshCw size={18} /> Sync Live Rates
                    </button>
                </form>
            </header>

            <div className={styles.grid}>
                {rates?.map((item) => (
                    <div key={item.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.currencyFlag}>{item.currency}</div>
                            <TrendingUp size={16} className={styles.icon} />
                        </div>

                        <div className={styles.cardBody}>
                            <label className={styles.label}>1 USD =</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.symbol}>{item.currency}</span>
                                <input
                                    type="number"
                                    defaultValue={Number(item.rate)}
                                    className={styles.input}
                                    step="0.0001"
                                    name="rate"
                                    disabled
                                />
                            </div>
                        </div>
                        <div className={styles.footer}>
                            Last updated: {new Date(item.updatedAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}

                {(!rates || rates.length === 0) && (
                    <div className={styles.emptyState}>
                        <p>No rates found. Click &quot;Sync Live Rates&quot; to initialize.</p>
                    </div>
                )}
            </div>
        </div>
    );
}