'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { LogOut, Timer } from 'lucide-react';
import styles from './SessionTimeout.module.css';

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 Minutes
const WARNING_DURATION = 60 * 1000;      // 60 Seconds

export default function SessionTimeout() {
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
    const logoutTimer = useRef<NodeJS.Timeout | null>(null);
    const countdownInterval = useRef<NodeJS.Timeout | null>(null);

    const handleLogout = useCallback(() => {
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        if (logoutTimer.current) clearTimeout(logoutTimer.current);
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

        signOut({ callbackUrl: '/login?error=SessionExpired' });
    }, []);

    const startCountdown = useCallback(() => {
        setTimeLeft(60);

        // Force Logout after 60s
        logoutTimer.current = setTimeout(() => {
            handleLogout();
        }, WARNING_DURATION);

        // Update visual counter every second
        countdownInterval.current = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
    }, [handleLogout]);

    const resetTimer = useCallback(() => {
        if (showWarning) return;

        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        if (logoutTimer.current) clearTimeout(logoutTimer.current);
        if (countdownInterval.current) clearInterval(countdownInterval.current);

        inactivityTimer.current = setTimeout(() => {
            setShowWarning(true);
            startCountdown();
        }, INACTIVITY_LIMIT);

    }, [showWarning, startCountdown]);

    const handleStayLoggedIn = () => {
        setShowWarning(false);
        if (logoutTimer.current) clearTimeout(logoutTimer.current);
        if (countdownInterval.current) clearInterval(countdownInterval.current);

        resetTimer();
    };

    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'click', 'scroll', 'keydown'];
        resetTimer();
        const handler = () => resetTimer();
        events.forEach((event) => {
            window.addEventListener(event, handler);
        });
        return () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            if (logoutTimer.current) clearTimeout(logoutTimer.current);
            if (countdownInterval.current) clearInterval(countdownInterval.current);

            events.forEach((event) => {
                window.removeEventListener(event, handler);
            });
        };
    }, [resetTimer]);

    if (!showWarning) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.iconBox}>
                    <Timer size={32} />
                </div>

                <h2 className={styles.title}>Session Timeout</h2>
                <p className={styles.text}>
                    For your security, you will be automatically logged out in <strong>{timeLeft} seconds</strong> due to inactivity.
                </p>

                <div className={styles.actions}>
                    <button onClick={handleLogout} className={styles.secondaryBtn}>
                        <LogOut size={16} /> Log Out Now
                    </button>
                    <button onClick={handleStayLoggedIn} className={styles.primaryBtn}>
                        I&apos;m Still Here
                    </button>
                </div>
            </div>
        </div>
    );
}