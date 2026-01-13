import { db } from "@/lib/db";
import LoanDecisionButtons from "./LoanDecisionButtons";
import styles from "./loans.module.css";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminLoansPage() {
    // 1. Security Check
    await requireAdmin();

    // 2. Fetch Pending
    const pendingLoans = await db.loan.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch Active/Paid
    const activeLoans = await db.loan.findMany({
        where: { OR: [{ status: 'APPROVED' }, { status: 'PAID' }] },
        include: { user: true },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Loan Management</h1>
            </header>

            {/* SECTION 1: PENDING APPROVALS */}
            <h3 className={styles.sectionTitle}>⚠️ Pending Approvals</h3>
            {pendingLoans.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No pending applications.</p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Amount</th>
                                <th>Term</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingLoans.map(loan => (
                                <tr key={loan.id}>
                                    <td>
                                        <div className={styles.userName}>{loan.user.fullName}</div>
                                        <div className={styles.userId}>{loan.user.email}</div>
                                    </td>
                                    <td className={styles.money}>
                                        {Number(loan.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                    <td>{loan.termMonths} Months</td>
                                    <td><LoanDecisionButtons loanId={loan.id} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SECTION 2: ACTIVE PORTFOLIO */}
            <h3 className={styles.sectionTitle}>📊 Active Portfolio</h3>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Total Debt</th>
                            <th>Repaid</th>
                            <th>Remaining</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeLoans.map(loan => {
                            const total = Number(loan.totalRepayment);
                            const repaid = Number(loan.repaidAmount);
                            const remaining = total - repaid;
                            const percent = (repaid / total) * 100;

                            return (
                                <tr key={loan.id}>
                                    <td>
                                        <div className={styles.userName}>{loan.user.fullName}</div>
                                        <div className={styles.tiny}>{loan.reason}</div>
                                    </td>
                                    <td className={styles.money}>
                                        {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                    <td>
                                        <div className={styles.progressContainer}>
                                            <span className={styles.repaidText}>
                                                + {repaid.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </span>
                                            <div className={styles.track}>
                                                {/* Width is dynamic so it stays inline, but classes handle colors */}
                                                <div
                                                    className={styles.bar}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.remainingDebt}>
                                        {remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${styles[loan.status]}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}