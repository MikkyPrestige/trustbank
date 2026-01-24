'use client';

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Phone } from "lucide-react";
import styles from "./forgotPassword.module.css";
import { DEFAULT_SETTINGS } from "@/lib/get-settings";

interface Props {
    siteName?: string;
    contactEmail?: string;
    contactPhone?: string;
}

export default function ForgotPasswordCard({
    siteName = DEFAULT_SETTINGS.site_name,
    contactEmail = DEFAULT_SETTINGS.contact_email,
    contactPhone = DEFAULT_SETTINGS.contact_phone
}: Props) {
    return (
        <div className={styles.pageWrapper}>

            <div className={styles.ambientMesh}></div>

            <div className={styles.formContainer}>

                <div className={styles.glassForm}>

                    <div className={styles.dangerIconBox}>
                        <ShieldAlert size={40} />
                    </div>

                    <div className={styles.header}>
                        <h1>Account Security</h1>
                        <p>Automated password resets are disabled.</p>
                    </div>

                    <div className={styles.infoCard}>
                        <p className={styles.infoText}>
                            To protect your assets, {siteName} Enterprise requires manual identity verification for all credential resets.
                        </p>

                        <div className={styles.contactRow}>
                            <span className={styles.contactLabel}>Contact Security Team</span>
                            <div className={styles.contactValue}>{contactEmail}</div>
                        </div>

                        <div className={styles.phoneText}>
                            <Phone size={14} /> {contactPhone}
                        </div>
                    </div>

                    <Link href="/login" className={styles.secondaryBtn}>
                        <ArrowLeft size={18} /> Return to Vault Access
                    </Link>

                </div>
            </div>
        </div>
    );
}