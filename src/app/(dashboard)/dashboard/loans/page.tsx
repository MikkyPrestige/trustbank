import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import LoanApplicationForm from "@/components/dashboard/loans/LoanApplicationForm";
import RepaymentModal from "@/components/dashboard/loans/RepaymentModal";
import styles from "../../../../components/dashboard/loans/loans.module.css";
import { TrendingUp, PieChart, CheckCircle, Lock, History } from "lucide-react";
import { KycStatus } from "@prisma/client";

export default async function LoansPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    const isVerified = user?.kycStatus === KycStatus.VERIFIED;

    const rawLoans = await db.loan.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    const account = await db.account.findFirst({
        where: { userId: session.user.id },
        orderBy: { availableBalance: 'desc' }
    });
    const maxPayable = Number(account?.availableBalance || 0);

    const totalBorrowed = rawLoans
        .filter(l => l.status === 'APPROVED' || l.status === 'PAID')
        .reduce((sum, l) => sum + Number(l.totalRepayment), 0);

    const totalRepaid = rawLoans
        .reduce((sum, l) => sum + Number(l.repaidAmount), 0);

    const remainingDebt = totalBorrowed - totalRepaid;

    const loans = rawLoans.map(loan => ({
        ...loan,
        amount: Number(loan.amount),
        monthlyPayment: Number(loan.monthlyPayment),
        totalRepayment: Number(loan.totalRepayment),
        repaidAmount: Number(loan.repaidAmount),
        balanceRemaining: Number(loan.balanceRemaining),
    }));

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Credit & Loans</h1>
                <p className={styles.subtitle}>Instant approval. Competitive rates. Flexible terms.</p>
            </header>

            {/* SUMMARY STATS */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.iconRed}`}>
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Debt</p>
                        <h3 className={styles.statValue}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(remainingDebt)}
                        </h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.iconGreen}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Repaid</p>
                        <h3 className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRepaid)}
                        </h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.iconBox} ${styles.iconBlue}`}>
                        <PieChart size={24} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Active Loans</p>
                        <h3 className={styles.statValue}>
                            {loans.filter(l => l.status === 'APPROVED').length}
                        </h3>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* LEFT: APPLICATION FORM */}
                <div className={styles.glassCard}>
                    {!isVerified ? (
                        <div className={styles.lockedState}>
                            <div className={styles.lockIconWrapper}>
                                <Lock size={40} className={styles.lockIcon} />
                            </div>
                            <h2>Loan Access Locked</h2>
                            <p>To ensure security and compliance, you must complete your Identity Verification (KYC) before applying for credit.</p>
                            <a href="/dashboard/verify" className={styles.verifyLink}>
                                Verify Identity Now
                            </a>
                        </div>
                    ) : (
                        <>
                            <h2 className={styles.cardHeader}>
                                <TrendingUp size={20} color="#3b82f6" />
                                Apply for a New Loan
                            </h2>
                            <LoanApplicationForm />
                        </>
                    )}
                </div>

                {/* RIGHT: HISTORY */}
                <div className={styles.glassCard}>
                    <h2 className={styles.cardHeader}>
                        <History size={20} color="#888" />
                        Your History
                    </h2>
                    {loans.length === 0 ? (
                        <div className={styles.empty}>
                            <p>You have no loan history.</p>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {loans.map(loan => {
                                const progress = loan.totalRepayment > 0
                                    ? Math.min(100, (loan.repaidAmount / loan.totalRepayment) * 100)
                                    : 0;

                                return (
                                    <div key={loan.id} className={styles.loanItem}>
                                        <div className={styles.loanTop}>
                                            <span className={styles.loanAmount}>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(loan.amount)}
                                            </span>
                                            <span className={`${styles.badge} ${styles[loan.status]}`}>{loan.status}</span>
                                        </div>

                                        {/* PROGRESS BAR */}
                                        {(loan.status === 'APPROVED' || loan.status === 'PAID') && (
                                            <div className={styles.progressWrapper}>
                                                <div className={styles.progressStats}>
                                                    <span>Paid: ${loan.repaidAmount.toFixed(0)}</span>
                                                    <span>Total: ${loan.totalRepayment.toFixed(0)}</span>
                                                </div>
                                                <div className={styles.progressBar}>
                                                    <div
                                                        className={`${styles.progressFill} ${loan.status === 'PAID' ? styles.fillGreen : styles.fillBlue}`}
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        <div className={styles.loanFooter}>
                                            <span className={styles.loanDetails}>{loan.termMonths} Months • {loan.reason}</span>

                                            {loan.status === 'APPROVED' && (
                                                <RepaymentModal loan={loan} maxPayable={maxPayable} />
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}