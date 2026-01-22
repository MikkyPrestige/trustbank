'use client';

import { useState } from 'react';
import styles from './WealthSimulator.module.css';
import { TrendingUp, Shield, PieChart, Info } from 'lucide-react';

export default function WealthSimulator() {
    const [risk, setRisk] = useState(50);

    // Dynamic Allocation Logic based on Risk (0 = Conservative, 100 = Aggressive)
    const allocations = {
        stocks: Math.floor(20 + (risk * 0.5)),      // 20% -> 70%
        crypto: Math.floor(0 + (risk * 0.15)),      // 0% -> 15%
        realEstate: Math.floor(10 + (risk * 0.1)),  // 10% -> 20%
        bonds: Math.floor(70 - (risk * 0.7)),       // 70% -> 0% (Cash/Bonds)
    };

    // Ensure it equals 100% (simple adjustment for rounding)
    const total = allocations.stocks + allocations.crypto + allocations.realEstate + allocations.bonds;
    if (total < 100) allocations.bonds += (100 - total);

    // Projected Return (Fake math for demo)
    const projectedReturn = (4 + (risk * 0.08)).toFixed(1);

    // CSS Conic Gradient for the Pie Chart
    const pieStyle = {
        background: `conic-gradient(
            var(--primary) 0% ${allocations.stocks}%,
            #eab308 ${allocations.stocks}% ${allocations.stocks + allocations.crypto}%,
            #a855f7 ${allocations.stocks + allocations.crypto}% ${allocations.stocks + allocations.crypto + allocations.realEstate}%,
            #64748b ${allocations.stocks + allocations.crypto + allocations.realEstate}% 100%
        )`
    };

    return (
        <div className={styles.simCard}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <PieChart size={24} />
                </div>
                <div>
                    <h3>Portfolio Simulator</h3>
                    <p>Adjust the slider to see how we structure portfolios based on risk.</p>
                </div>
            </div>

            <div className={styles.grid}>
                {/* CONTROLS */}
                <div className={styles.controls}>
                    <label className={styles.sliderLabel}>
                        Risk Tolerance
                        <span className={styles.riskValue}>
                            {risk < 30 ? "Conservative" : risk < 70 ? "Balanced" : "Aggressive"}
                        </span>
                    </label>

                    <input
                        type="range" min="0" max="100" step="10"
                        value={risk}
                        onChange={(e) => setRisk(Number(e.target.value))}
                        className={styles.slider}
                    />

                    <div className={styles.statsRow}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Est. Annual Return</span>
                            <span className={styles.statValue}>{projectedReturn}%</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>Volatility</span>
                            <span className={styles.statValue}>
                                {risk < 30 ? "Low" : risk < 70 ? "Medium" : "High"}
                            </span>
                        </div>
                    </div>

                    <div className={styles.note}>
                        <Info size={16} />
                        <p>Past performance does not guarantee future results. This is a simulation.</p>
                    </div>
                </div>

                {/* VISUALIZATION */}
                <div className={styles.chartWrapper}>
                    <div className={styles.pieChart} style={pieStyle}>
                        <div className={styles.innerCircle}>
                            <span>Allocation</span>
                        </div>
                    </div>

                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <div className={styles.dot} style={{ background: 'var(--primary)' }}></div>
                            <span>Global Stocks ({allocations.stocks}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.dot} style={{ background: '#eab308' }}></div>
                            <span>Digital Assets ({allocations.crypto}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.dot} style={{ background: '#a855f7' }}></div>
                            <span>Real Estate ({allocations.realEstate}%)</span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.dot} style={{ background: '#64748b' }}></div>
                            <span>Bonds & Cash ({allocations.bonds}%)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}