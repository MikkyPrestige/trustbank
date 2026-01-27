'use client';

import { useState } from 'react';
import styles from './WellnessPulse.module.css';
import { Activity, Brain, Target, TrendingUp, ArrowRight } from 'lucide-react';

interface WellnessPulseProps {
    settings: any;
}

export default function WellnessPulse({ settings }: WellnessPulseProps) {
    const [scores, setScores] = useState({ savings: 5, debt: 5, goals: 5 });
    const [showResult, setShowResult] = useState(false);

    const totalScore = Math.round(((scores.savings + scores.debt + scores.goals) / 30) * 100);

    const getFeedback = () => {
        if (totalScore > 80) return { label: settings.learn_pulse_res_high, color: "#22c55e", text: settings.learn_pulse_res_high_msg };
        if (totalScore > 50) return { label: settings.learn_pulse_res_mid, color: "#f59e0b", text: settings.learn_pulse_res_mid_msg };
        return { label: settings.learn_pulse_res_low, color: "#ef4444", text: settings.learn_pulse_res_low_msg };
    };

    return (
        <div className={styles.pulseCard}>
            <div className={styles.header}>
                <div className={styles.iconBox}><Brain size={28} /></div>
                <div>
                    <h3>{settings.learn_pulse_title}</h3>
                    <p>{settings.learn_pulse_desc}</p>
                </div>
            </div>

            {!showResult ? (
                <div className={styles.slidersBox}>
                    <div className={styles.inputGroup}>
                        <label><TrendingUp size={16} /> {settings.learn_pulse_q1}</label>
                        <input type="range" min="1" max="10" value={scores.savings} onChange={(e) => setScores({ ...scores, savings: Number(e.target.value) })} className={styles.range} />
                        <span className={styles.valueDisplay}>{scores.savings}/10</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Activity size={16} /> {settings.learn_pulse_q2}</label>
                        <input type="range" min="1" max="10" value={scores.debt} onChange={(e) => setScores({ ...scores, debt: Number(e.target.value) })} className={styles.range} />
                        <span className={styles.valueDisplay}>{scores.debt}/10</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Target size={16} /> {settings.learn_pulse_q3}</label>
                        <input type="range" min="1" max="10" value={scores.goals} onChange={(e) => setScores({ ...scores, goals: Number(e.target.value) })} className={styles.range} />
                        <span className={styles.valueDisplay}>{scores.goals}/10</span>
                    </div>

                    <button className={styles.analyzeBtn} onClick={() => setShowResult(true)}>
                        {settings.learn_pulse_btn}
                    </button>
                </div>
            ) : (
                <div className={styles.resultBox}>
                    <div className={styles.scoreCircle} style={{ borderColor: getFeedback().color }}>
                        <span className={styles.scoreNumber}>{totalScore}</span>
                        <span className={styles.scoreLabel}>/ 100</span>
                    </div>

                    <h2 style={{ color: getFeedback().color }}>{getFeedback().label}</h2>
                    <p>{getFeedback().text}</p>

                    <button className={styles.resetBtn} onClick={() => setShowResult(false)}>
                        Recalculate <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}