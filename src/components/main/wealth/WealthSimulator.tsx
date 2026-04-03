'use client';

import { useState } from 'react';
import styles from './WealthSimulator.module.css';
import { PieChart, Info } from 'lucide-react';

interface SimulatorProps {
    settings: any;
}

export default function WealthSimulator({ settings }: SimulatorProps) {
    const [risk, setRisk] = useState(50);

    const allocations = {
        stocks: Math.floor(20 + (risk * 0.5)),
        crypto: Math.floor(0 + (risk * 0.15)),
        realEstate: Math.floor(10 + (risk * 0.1)),
        bonds: Math.floor(70 - (risk * 0.7)),
    };

    const projectedReturn = (4 + (risk * 0.08)).toFixed(1);

    const pieStyle = {
        background: `conic-gradient(
            #2563eb 0% ${allocations.stocks}%,
            #eab308 ${allocations.stocks}% ${allocations.stocks + allocations.crypto}%,
            #a855f7 ${allocations.stocks + allocations.crypto}% ${allocations.stocks + allocations.crypto + allocations.realEstate}%,
            #64748b ${allocations.stocks + allocations.crypto + allocations.realEstate}% 100%
        )`
    };

    const getRiskStatus = () => {
        if (risk < 30) return settings.wealth_sim_status_low;
        if (risk < 70) return settings.wealth_sim_status_mid;
        return settings.wealth_sim_status_high;
    };

    const getVolStatus = () => {
        if (risk < 30) return settings.wealth_sim_vol_low;
        if (risk < 70) return settings.wealth_sim_vol_mid;
        return settings.wealth_sim_vol_high;
    };

    return (
        <div className={styles.simCard}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}><PieChart size={24} /></div>
                <div>
                    <h3>{settings.wealth_sim_title}</h3>
                    <p>{settings.wealth_sim_desc}</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.controls}>
                    <label className={styles.sliderLabel}>
                        {settings.wealth_sim_risk_label}
                        <span className={styles.riskValue}>{getRiskStatus()}</span>
                    </label>

                    <input
                        type="range" min="0" max="100" step="10"
                        value={risk}
                        onChange={(e) => setRisk(Number(e.target.value))}
                        className={styles.slider}
                        style={{ '--value': `${risk}%` } as React.CSSProperties}
                    />
                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>{settings.wealth_sim_return_label}</span>
                            <span className={styles.statValue}>{projectedReturn}%</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>{settings.wealth_sim_label_volatility}</span>
                            <span className={styles.statValue}>{getVolStatus()}</span>
                        </div>
                    </div>

                    <div className={styles.note}>
                        <Info size={16} className={styles.infoIcon} />
                        <p>{settings.wealth_sim_note}</p>
                    </div>
                </div>

                <div className={styles.chartWrapper}>
                    <div className={styles.pieChart} style={pieStyle}>
                        <div className={styles.innerCircle}>
                            <span>{settings.wealth_sim_label_allocation}</span>
                        </div>
                    </div>

                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <div className={`${styles.dot} ${styles.stocks}`}></div>
                            <span>{settings.wealth_sim_legend_stocks} ({allocations.stocks}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={`${styles.dot} ${styles.crypto}`}></div>
                            <span>{settings.wealth_sim_legend_crypto} ({allocations.crypto}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={`${styles.dot} ${styles.realEstate}`}></div>
                            <span>{settings.wealth_sim_legend_real} ({allocations.realEstate}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={`${styles.dot} ${styles.bonds}`}></div>
                            <span>{settings.wealth_sim_legend_bonds} ({allocations.bonds}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}