import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import KycForm from "@/components/dashboard/verify/KycForm";
import { ShieldCheck, Clock, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { KycStatus } from "@prisma/client";
import styles from "../../../../components/dashboard/verify/verify.module.css"

export default async function VerifyPage() {
    const session = await auth();
    if (!session?.user?.email) redirect("/login");

    const user = await db.user.findUnique({
        where: { email: session.user.email },
        select: {
            kycStatus: true,
            kycRejectionReason: true
        }
    });

    if (!user) redirect("/login");

    const isVerified = user.kycStatus === KycStatus.VERIFIED;
    const isPending = user.kycStatus === KycStatus.PENDING;
    const isFailed = user.kycStatus === KycStatus.FAILED;
    const isNotSubmitted = user.kycStatus === KycStatus.NOT_SUBMITTED;

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <div className={styles.iconBadge}>
                        <ShieldCheck size={30} />
                    </div>
                    <h1 className={styles.title}>Identity Verification</h1>
                    <p className={styles.subtitle}>
                        To comply with financial regulations and unlock high-limit transactions,
                        we need to verify your identity through a secure KYC process.
                    </p>
                </header>

                <div className={styles.statusSection}>
                    {isVerified && (
                        <div className={`${styles.statusCard} ${styles.success}`}>
                            <div className={styles.statusIcon}><CheckCircle2 size={32} /></div>
                            <div>
                                <h3>Account Verified</h3>
                                <p>Identity verified. You have full access to global banking features.</p>
                            </div>
                        </div>
                    )}

                    {isPending && (
                        <div className={`${styles.statusCard} ${styles.pending}`}>
                            <div className={styles.statusIcon}><Clock size={32} /></div>
                            <div>
                                <h3>Verification in Progress</h3>
                                <p>Our compliance team is reviewing your documents. This typically takes 24-48 business hours.</p>
                            </div>
                        </div>
                    )}

                    {isFailed && (
                        <div className={`${styles.statusCard} ${styles.error}`}>
                            <div className={styles.statusIcon}><XCircle size={32} /></div>
                            <div>
                                <h3>Verification Rejected</h3>
                                <p className={styles.errorReason}>
                                    Reason: {user.kycRejectionReason || "Documents were unclear or invalid."}
                                </p>
                                <p className={styles.errorSubtext}>
                                    Please correct the issue above and re-upload your documents.
                                </p>
                            </div>
                        </div>
                    )}

                    {isNotSubmitted && (
                        <div className={`${styles.statusCard} ${styles.neutral}`}>
                            <div className={styles.statusIcon}><AlertTriangle size={32} /></div>
                            <div>
                                <h3>Action Required</h3>
                                <p>Identity documentation is required to remove withdrawal limits on your account.</p>
                            </div>
                        </div>
                    )}
                </div>

                {(isNotSubmitted || isFailed) && (
                    <div className={styles.formSection}>
                        <KycForm />
                    </div>
                )}
            </div>
        </div>
    );
}