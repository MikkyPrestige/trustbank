'use client';

import { useState, useMemo } from 'react';
import styles from './SavingsCalculator.module.css';
import { DollarSign, TrendingUp } from 'lucide-react';

interface CalculatorProps {
    settings: any;
}

export default function SavingsCalculator({ settings }: CalculatorProps) {
    const maxDep = settings.save_calc_max_deposit || 100000;
    const maxMonth = settings.save_calc_max_monthly || 5000;
    const defaultApy = settings.save_calc_default_apy || 4.50;
    const symbol = settings.borrow_calc_currency || '$';

    const [initialDeposit, setInitialDeposit] = useState(5000);
    const [monthlyContrib, setMonthlyContrib] = useState(500);
    const [years, setYears] = useState(10);
    const [apy, setApy] = useState(defaultApy);

    const result = useMemo(() => {
        const r = apy / 100 / 12;
        const n = years * 12;

        const fvInitial = initialDeposit * Math.pow(1 + r, n);
        const fvContrib = r === 0 ? (monthlyContrib * n) : monthlyContrib * ((Math.pow(1 + r, n) - 1) / r);

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
                    <h3>{settings.save_calc_title}</h3>
                    <p>{settings.save_calc_desc_prefix} {apy}% {settings.save_calc_label_apy}.</p>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.inputs}>
                    <div className={styles.inputGroup}>
                        <label>{settings.save_calc_label_initial}</label>
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
                            type="range" min="0" max={maxDep} step="500"
                            value={initialDeposit}
                            onChange={e => setInitialDeposit(Number(e.target.value))}
                            className={styles.range}
                            style={getBgSize(initialDeposit, 0, maxDep)}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>{settings.save_calc_label_monthly}</label>
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
                            type="range" min="0" max={maxMonth} step="50"
                            value={monthlyContrib}
                            onChange={e => setMonthlyContrib(Number(e.target.value))}
                            className={styles.range}
                            style={getBgSize(monthlyContrib, 0, maxMonth)}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>{settings.save_calc_label_years}</label>
                            <select
                                value={years}
                                onChange={e => setYears(Number(e.target.value))}
                                className={styles.select}
                            >
                                {[1, 5, 10, 20, 30, 40].map(y => <option key={y} value={y}>{y} Years</option>)}
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{settings.save_calc_label_apy} (%)</label>
                            <input
                                type="number" step="0.1"
                                value={apy}
                                onChange={e => setApy(Number(e.target.value))}
                                className={styles.numberInput}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.results}>
                    <span className={styles.resultLabel}>{settings.save_calc_label_res} {years} Years</span>
                    <h2 className={styles.totalValue}>
                        {symbol}{result.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </h2>

                    <div className={styles.breakdownBar}>
                        <div className={styles.barInvested} style={{ flex: result.invested / result.total }}></div>
                        <div className={styles.barInterest} style={{ flex: result.interest / result.total }}></div>
                    </div>

                    <div className={styles.legend}>
                        <div className={styles.legendItem}>
                            <div className={styles.dotInvested}></div>
                            <span>{settings.save_calc_label_deposits}: <strong>{symbol}{result.invested.toLocaleString()}</strong></span>
                        </div>
                        <div className={styles.legendItem}>
                            <div className={styles.dotInterest}></div>
                            <span>{settings.save_calc_label_interest}: <strong>{symbol}{result.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
                        </div>
                    </div>
                    <button className={styles.ctaBtn}>{settings.save_calc_cta}</button>
                </div>
            </div>
        </div>
    );
}