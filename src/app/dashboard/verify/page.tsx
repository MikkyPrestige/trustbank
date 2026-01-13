import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import KycForm from "./KycForm";
import { ShieldCheck, Clock, AlertTriangle, XCircle } from "lucide-react";
import styles from "./verify.module.css";

export default async function VerifyPage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { email: session.user.email! }
    });

    if (!user) return null;

    // Define States based on Enum
    const isVerified = user.kycStatus === 'VERIFIED';
    const isPending = user.kycStatus === 'PENDING';
    const isFailed = user.kycStatus === 'FAILED';
    const isNotSubmitted = !user.kycStatus || user.kycStatus === 'NOT_SUBMITTED';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Identity Verification</h1>
                <p className={styles.subtitle}>Complete KYC compliance to unlock higher transaction limits.</p>
            </header>

            <div className={styles.statusBox}>

                {/* 1. VERIFIED */}
                {isVerified && (
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

                {/* 2. PENDING */}
                {isPending && (
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

                {/* 3. FAILED */}
                {isFailed && (
                    <div className={`${styles.statusCard} ${styles.error}`}>
                        <div className={styles.errorIcon}>
                            <XCircle size={32} />
                        </div>
                        <div className={styles.statusText}>
                            <h3>Verification Rejected</h3>
                            <p>Your previous submission was rejected. Please ensure your photos are clear and legible before trying again.</p>
                        </div>
                    </div>
                )}

                {/* 4. NOT SUBMITTED */}
                {isNotSubmitted && (
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
            </div>

            {/* SHOW FORM IF: Not Submitted OR Failed */}
            {(isNotSubmitted || isFailed) && (
                <KycForm />
            )}
        </div>
    );
}