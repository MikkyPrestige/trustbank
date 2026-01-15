'use client';

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Phone, LockKeyhole } from "lucide-react";
import styles from "./forgotPassword.module.css";

export default function ForgotPasswordPage() {
    return (
        <div className={styles.pageWrapper}>

            {/* 1. Ambient Background */}
            <div className={styles.ambientMesh}></div>

            <div className={styles.formContainer} style={{ maxWidth: '460px' }}>

                {/* 2. Glass Card */}
                <div className={styles.glassForm}>

                    {/* Red Alert Icon */}
                    <div className={styles.dangerIconBox}>
                        <ShieldAlert size={40} />
                    </div>

                    {/* Header */}
                    <div className={styles.header}>
                        <h1>Account Security</h1>
                        <p>Automated password resets are disabled.</p>
                    </div>

                    {/* Info Card */}
                    <div className={styles.infoCard}>
                        <p className={styles.infoText}>
                            To protect your assets, TrustBank Enterprise requires manual identity verification for all credential resets.
                        </p>

                        <div className={styles.contactRow}>
                            <span className={styles.contactLabel}>Contact Security Team</span>
                            <div className={styles.contactValue}>support@trustbank.com</div>
                        </div>

                        <div className={styles.phoneText}>
                            <Phone size={14} /> +1 (800) 123-4567
                        </div>
                    </div>

                    {/* Back Button */}
                    <Link href="/login" className={styles.secondaryBtn}>
                        <ArrowLeft size={18} /> Return to Vault Access
                    </Link>

                </div>
            </div>
        </div>
    );
}