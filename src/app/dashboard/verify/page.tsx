import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import KycForm from "./KycForm";
import { ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import styles from "./verify.module.css";

export default async function VerifyPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { email: session.user.email! }
    });

    if (!user) return null;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Identity Verification</h1>
                <p className={styles.subtitle}>Complete KYC compliance to unlock higher transaction limits.</p>
            </header>

            {/* STATUS CARDS */}
            <div className={styles.statusBox}>

                {/* 1. NOT VERIFIED / REQUIRED */}
                {user.status === 'ACTIVE' && !user.passportUrl && (
                    <div className={`${styles.statusCard} ${styles.alert}`}>
                        <div className={styles.alertIcon}>
                            <AlertTriangle size={32} />
                        </div>
                        <div className={styles.statusText}>
                            <h3>Verification Required</h3>
                            <p>Your account is currently unverified. Please upload a valid Government ID and Passport Photo to lift restrictions.</p>
                        </div>
                    </div>
                )}

                {/* 2. PENDING REVIEW */}
                {user.status === 'PENDING_VERIFICATION' && (
                    <div className={`${styles.statusCard} ${styles.pending}`}>
                        <div className={styles.pendingIcon}>
                            <Clock size={32} />
                        </div>
                        <div className={styles.statusText}>
                            <h3>Under Review</h3>
                            <p>We have received your documents. Our compliance team is currently reviewing your application. This usually takes 24-48 hours.</p>
                        </div>
                    </div>
                )}

                {/* 3. VERIFIED */}
                {user.kycVerified && (
                    <div className={`${styles.statusCard} ${styles.success}`}>
                        <div className={styles.successIcon}>
                            <ShieldCheck size={32} />
                        </div>
                        <div className={styles.statusText}>
                            <h3>Verified Account</h3>
                            <p>Identity verification complete. You now have full access to all banking features and maximum global limits.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* FORM (Only show if not pending/verified) */}
            {user.status !== 'PENDING_VERIFICATION' && !user.kycVerified && (
                <KycForm />
            )}
        </div>
    );
}