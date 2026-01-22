'use client';

import { useState, ReactNode } from 'react';
import styles from './CoverageWizard.module.css';
import { Shield, Home, Heart, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

// 1. Define the Shape of an Option
interface WizardOption {
    label: string;
    value: string;
    icon?: ReactNode;
}

// 2. Define the Shape of a Question
interface WizardQuestion {
    id: number;
    question: string;
    options: WizardOption[];
}

const QUESTIONS: WizardQuestion[] = [
    {
        id: 1,
        question: "What matters most to you right now?",
        options: [
            { label: "My Family's Future", icon: <Heart size={24} />, value: 'family' },
            { label: "My Assets (Home/Car)", icon: <Home size={24} />, value: 'assets' },
            { label: "My Health", icon: <Activity size={24} />, value: 'health' }
        ]
    },
    {
        id: 2,
        question: "What is your current life stage?",
        options: [
            { label: "Just Starting Out", value: 'early' },
            { label: "Growing Family", value: 'mid' },
            { label: "Approaching Retirement", value: 'late' }
        ]
    }
];

export default function CoverageWizard() {
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState<Record<number, string>>({});
    const [showResult, setShowResult] = useState(false);

    const handleSelect = (val: string) => {
        setSelections({ ...selections, [step]: val });
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            setShowResult(true);
        }
    };

    const reset = () => {
        setStep(0);
        setSelections({});
        setShowResult(false);
    };

    const getRecommendation = () => {
        if (selections[0] === 'health' || selections[1] === 'late') {
            return {
                title: "Medicare & Supplemental Health",
                desc: "As you mature, filling the gaps in healthcare becomes critical. Our Medicare specialists can guide you.",
                product: "Medicare Insurance"
            };
        }
        if (selections[0] === 'assets') {
            return {
                title: "Bundled Home & Auto",
                desc: "Protect your biggest investments. Bundling your policies can save you up to 20% annually.",
                product: "Property & Casualty"
            };
        }
        return {
            title: "Term Life Insurance",
            desc: "The most affordable way to ensure your loved ones are financially secure, no matter what happens.",
            product: "Life Insurance"
        };
    };

    return (
        <div className={styles.wizardCard}>
            <div className={styles.wizardHeader}>
                <div className={styles.iconBox}><Shield size={28} /></div>
                <div>
                    <h3>Coverage Finder</h3>
                    <p>Not sure what you need? Answer 2 questions.</p>
                </div>
            </div>

            {!showResult ? (
                <div className={styles.questionBox}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${((step + 1) / 2) * 100}%` }}></div>
                    </div>

                    <h4 className={styles.questionText}>{QUESTIONS[step].question}</h4>

                    <div className={styles.optionsGrid}>
                        {QUESTIONS[step].options.map((opt, i) => (
                            <button key={i} className={styles.optionBtn} onClick={() => handleSelect(opt.value)}>
                                {opt.icon && <span className={styles.btnIcon}>{opt.icon}</span>}
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={styles.resultBox}>
                    <span className={styles.matchLabel}>
                        <CheckCircle2 size={14} className={styles.checkIcon} />
                        Best Match
                    </span>
                    <h2>{getRecommendation().title}</h2>
                    <p>{getRecommendation().desc}</p>

                    <div className={styles.resultActions}>
                        <button className={styles.primaryBtn}>
                            View {getRecommendation().product} <ArrowRight size={16} className={styles.btnArrow} />
                        </button>
                        <button className={styles.resetBtn} onClick={reset}>Start Over</button>
                    </div>
                </div>
            )}
        </div>
    );
}