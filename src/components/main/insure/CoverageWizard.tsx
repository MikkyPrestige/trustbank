'use client';

import { useState, ReactNode } from 'react';
import styles from './CoverageWizard.module.css';
import { Shield, Home, Heart, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CoverageWizardProps {
    settings: any;
}

interface WizardOption {
    label: string;
    value: string;
    icon?: ReactNode;
}

interface Question {
    id: number;
    question: string;
    options: WizardOption[];
}

export default function CoverageWizard({ settings }: CoverageWizardProps) {
    const [step, setStep] = useState(0);
    const [selections, setSelections] = useState<Record<number, string>>({});
    const [showResult, setShowResult] = useState(false);

    const questions: Question[] = [
        {
            id: 1,
            question: settings.insure_wiz_step1,
            options: [
                { label: settings.insure_wiz_step1_option1, icon: <Heart size={24} />, value: settings.insure_wiz_step1_option1Val },
                { label: settings.insure_wiz_step1_option2, icon: <Home size={24} />, value: settings.insure_wiz_step1_option2Val },
                { label: settings.insure_wiz_step1_option3, icon: <Activity size={24} />, value: settings.insure_wiz_step1_option3Val }
            ]
        },
        {
            id: 2,
            question: settings.insure_wiz_step2,
            options: [
                { label: settings.insure_wiz_step2_option1, value: settings.insure_wiz_step2_option1Val },
                { label: settings.insure_wiz_step2_option2, value: settings.insure_wiz_step2_option2Val },
                { label: settings.insure_wiz_step2_option3, value: settings.insure_wiz_step2_option3Val }
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
                link: settings.insure_prod1_link
            };
        }
        if (selections[0] === 'assets') {
            return {
                title: settings.insure_prod3_title, // Home
                desc: settings.insure_prod3_desc,
                link: settings.insure_prod3_link
            };
        }
        return {
            title: settings.insure_prod4_title, // Life
            desc: settings.insure_prod4_desc,
            link: settings.insure_prod4_link
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