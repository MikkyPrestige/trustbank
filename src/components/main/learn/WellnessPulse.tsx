'use client';

import { useState } from 'react';
import styles from './WellnessPulse.module.css';
import { Activity, Brain, Target, TrendingUp, ArrowRight } from 'lucide-react';

// 1. Define Props Interface
interface WellnessPulseProps {
    title?: string;
    desc?: string;
}

export default function WellnessPulse({
    title = "Financial Wellness Pulse",
    desc = "Rate your confidence (1-10) to get a personalized reading."
}: WellnessPulseProps) {
    const [scores, setScores] = useState({ savings: 5, debt: 5, goals: 5 });
    const [showResult, setShowResult] = useState(false);

    const totalScore = Math.round(((scores.savings + scores.debt + scores.goals) / 30) * 100);

    const getFeedback = () => {
        if (totalScore > 80) return { label: "Financial Master", color: "#22c55e", text: "You are crushing it! Focus on advanced wealth strategies." };
        if (totalScore > 50) return { label: "On The Right Track", color: "#f59e0b", text: "Solid foundation. Let's optimize your savings and debt." };
        return { label: "Needs Attention", color: "#ef4444", text: "Don't panic. We have the tools to help you build stability." };
    };

    return (
        <div className={styles.pulseCard}>
            <div className={styles.header}>
                <div className={styles.iconBox}><Brain size={28} /></div>
                <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                </div>
            </div>

            {!showResult ? (
                <div className={styles.slidersBox}>
                    <div className={styles.inputGroup}>
                        <label><TrendingUp size={16} /> I save 20% of my income monthly.</label>
                        <input
                            type="range" min="1" max="10" value={scores.savings}
                            onChange={(e) => setScores({ ...scores, savings: Number(e.target.value) })}
                            className={styles.range}
                        />
                        <span className={styles.valueDisplay}>{scores.savings}/10</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Activity size={16} /> My debt is manageable and decreasing.</label>
                        <input
                            type="range" min="1" max="10" value={scores.debt}
                            onChange={(e) => setScores({ ...scores, debt: Number(e.target.value) })}
                            className={styles.range}
                        />
                        <span className={styles.valueDisplay}>{scores.debt}/10</span>
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Target size={16} /> I have clear long-term financial goals.</label>
                        <input
                            type="range" min="1" max="10" value={scores.goals}
                            onChange={(e) => setScores({ ...scores, goals: Number(e.target.value) })}
                            className={styles.range}
                        />
                        <span className={styles.valueDisplay}>{scores.goals}/10</span>
                    </div>

                    <button className={styles.analyzeBtn} onClick={() => setShowResult(true)}>
                        Analyze My Health
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