'use client';

import { useState, useMemo } from 'react';
import styles from './SavingsCalculator.module.css';
import { DollarSign, TrendingUp } from 'lucide-react';

// 1. Accept Props
interface CalculatorProps {
    defaultApy?: number;
}

export default function SavingsCalculator({ defaultApy = 4.50 }: CalculatorProps) {
    const [initialDeposit, setInitialDeposit] = useState(5000);
    const [monthlyContrib, setMonthlyContrib] = useState(500);
    const [years, setYears] = useState(10);

    // 2. Use prop as initial state
    const [apy, setApy] = useState(defaultApy);

    const result = useMemo(() => {
        const r = apy / 100 / 12;
        const n = years * 12;

        const fvInitial = initialDeposit * Math.pow(1 + r, n);
        const fvContrib = monthlyContrib * ((Math.pow(1 + r, n) - 1) / r);

        const total = fvInitial + fvContrib;
        const totalInvested = initialDeposit + (monthlyContrib * 12 * years);
        const interestEarned = total - totalInvested;

        return {
            total: total,
            interest: interestEarned,
            invested: totalInvested
        };
    }, [initialDeposit, monthlyContrib, years, apy]);

    const getBgSize = (val: number, min: number, max: number) => {
        return { backgroundSize: `${((val - min) * 100) / (max - min)}% 100%` };
    };

    return (
        <div className={styles.calcCard}>
            <div className={styles.calcHeader}>
                <div className={styles.iconBox}>
                    <TrendingUp size={28} />
                </div>
                <div>
                    <h3>Watch Your Wealth Grow</h3>
                    <p>See the power of TrustBank&apos;s industry-leading {apy}% APY.</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.inputs}>

                    <div className={styles.inputGroup}>
                        <label>Initial Deposit</label>
                        <div className={styles.inputWrapper}>
                            <DollarSign size={18} className={styles.inputIcon} />
                            <input
                                type="number"
                                value={initialDeposit}
                                onChange={e => setInitialDeposit(Number(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                        <input
                            type="range" min="0" max="100000" step="500"
                            value={initialDeposit}
                            onChange={e => setInitialDeposit(Number(e.target.value))}
                            className={styles.range}
                            style={getBgSize(initialDeposit, 0, 100000)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Monthly Contribution</label>
                        <div className={styles.inputWrapper}>
                            <DollarSign size={18} className={styles.inputIcon} />
                            <input
                                type="number"
                                value={monthlyContrib}
                                onChange={e => setMonthlyContrib(Number(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                        <input
                            type="range" min="0" max="5000" step="50"
                            value={monthlyContrib}
                            onChange={e => setMonthlyContrib(Number(e.target.value))}
                            className={styles.range}
                            style={getBgSize(monthlyContrib, 0, 5000)}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Duration (Years)</label>
                            <select
                                value={years}
                                onChange={e => setYears(Number(e.target.value))}
                                className={styles.select}
                            >
                                {[1, 5, 10, 20, 30].map(y => <option key={y} value={y}>{y} Years</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>APY (%)</label>
                            <input
                                type="number"
                                value={apy}
                                onChange={e => setApy(Number(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                    </div>

                </div>

                {/* RESULTS */}
                <div className={styles.results}>
                    <span className={styles.resultLabel}>Projected Balance in {years} Years</span>
                    <h2 className={styles.totalValue}>
                        ${result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </h2>

                    <div className={styles.breakdownBar}>
                        <div className={styles.barInvested} style={{ flex: result.invested / result.total }}></div>
                        <div className={styles.barInterest} style={{ flex: result.interest / result.total }}></div>
                    </div>

                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <div className={styles.dotInvested}></div>
                            <span>Your Deposits: <strong>${result.invested.toLocaleString()}</strong></span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.dotInterest}></div>
                            <span>Interest Earned: <strong>${result.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
                        </div>
                    </div>

                    <button className={styles.ctaBtn}>Start Saving Today</button>
                </div>
            </div>
        </div>
    );
}