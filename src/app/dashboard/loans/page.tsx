import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import LoanApplicationForm from "./LoanApplicationForm";
import RepaymentModal from "./RepaymentModal";
import styles from "./loans.module.css";
import { TrendingUp, PieChart, CheckCircle, Lock, History } from "lucide-react";

export default async function LoansPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id }
    });

    const isVerified = user?.kycVerified;

    const rawLoans = await db.loan.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    const account = await db.account.findFirst({
        where: { userId: session.user.id },
        orderBy: { availableBalance: 'desc' }
    });
    const maxPayable = Number(account?.availableBalance || 0);

    // --- CALCULATE TOTALS ---
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
                    <div className={styles.iconBox} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
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
                    <div className={styles.iconBox} style={{ color: '#22c55e', background: 'rgba(34,197,94,0.1)' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className={styles.statLabel}>Total Repaid</p>
                        <h3 className={styles.statValue} style={{ color: '#22c55e' }}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalRepaid)}
                        </h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.iconBox} style={{ color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }}>
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
                            <div style={{ background: 'rgba(239,68,68,0.1)', padding: '1rem', borderRadius: '50%' }}>
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
                        <p className={styles.empty}>You have no loan history.</p>
                    ) : (
                        <div className={styles.list}>
                            {loans.map(loan => {
                                const progress = Math.min(100, (loan.repaidAmount / loan.totalRepayment) * 100);
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
                                            <div style={{ margin: '12px 0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666', marginBottom: '6px' }}>
                                                    <span>Paid: ${loan.repaidAmount.toFixed(0)}</span>
                                                    <span>Total: ${loan.totalRepayment.toFixed(0)}</span>
                                                </div>
                                                <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${progress}%`, background: loan.status === 'PAID' ? '#22c55e' : '#3b82f6', height: '100%', borderRadius: '3px' }}></div>
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