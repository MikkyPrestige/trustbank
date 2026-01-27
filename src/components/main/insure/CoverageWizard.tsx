'use client';

import { useState, ReactNode } from 'react';
import styles from './CoverageWizard.module.css';
import { Shield, Home, Heart, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CoverageWizardProps {
    settings: any; // 👈 Accept Settings
}

export default function CoverageWizard({ settings }: CoverageWizardProps) {
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState<Record<number, string>>({});
    const [showResult, setShowResult] = useState(false);

    // Dynamic Questions using CMS Labels
    const questions = [
        {
            id: 1,
            question: settings.insure_wiz_step1,
            options: [
                { label: "My Family's Future", icon: <Heart size={24} />, value: 'family' },
                { label: "My Assets (Home/Car)", icon: <Home size={24} />, value: 'assets' },
                { label: "My Health", icon: <Activity size={24} />, value: 'health' }
            ]
        },
        {
            id: 2,
            question: settings.insure_wiz_step2,
            options: [
                { label: "Just Starting Out", value: 'early' },
                { label: "Growing Family", value: 'mid' },
                { label: "Approaching Retirement", value: 'late' }
            ]
        }
    ];

    const handleSelect = (val: string) => {
        setSelections({ ...selections, [step]: val });
        if (step < questions.length - 1) {
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
                title: settings.insure_prod1_title, // Medicare
                desc: settings.insure_prod1_desc,
                link: "#medicare"
            };
        }
        if (selections[0] === 'assets') {
            return {
                title: settings.insure_prod3_title, // Home
                desc: settings.insure_prod3_desc,
                link: "#home"
            };
        }
        return {
            title: settings.insure_prod4_title, // Life
            desc: settings.insure_prod4_desc,
            link: "#life"
        };
    };

    return (
        <div className={styles.wizardCard}>
            <div className={styles.wizardHeader}>
                <div className={styles.iconBox}><Shield size={28} /></div>
                <div>
                    <h3>{settings.insure_wiz_title}</h3>
                    <p>{settings.insure_wiz_desc}</p>
                </div>
            </div>

            {!showResult ? (
                <div className={styles.questionBox}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${((step + 1) / 2) * 100}%` }}></div>
                    </div>

                    <h4 className={styles.questionText}>{questions[step].question}</h4>

                    <div className={styles.optionsGrid}>
                        {questions[step].options.map((opt, i) => (
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
                        {settings.insure_wiz_match}
                    </span>
                    <h2>{getRecommendation().title}</h2>
                    <p>{getRecommendation().desc}</p>

                    <div className={styles.resultActions}>
                        <a href={getRecommendation().link} className={styles.primaryBtn}>
                            {settings.insure_wiz_btn_view} <ArrowRight size={16} className={styles.btnArrow} />
                        </a>
                        <button className={styles.resetBtn} onClick={reset}>{settings.insure_wiz_btn_reset}</button>
                    </div>
                </div>
            )}
        </div>
    );
}