import { db } from "@/lib/db";
import LoanDecisionButtons from "./LoanDecisionButtons";
import styles from "../admin.module.css";

export default async function AdminLoansPage() {
    // 1. Fetch Pending
    const pendingLoans = await db.loan.findMany({
        where: { status: 'PENDING' },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch Active/Paid
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
                <div className={styles.emptyState} style={{ marginBottom: '3rem' }}>
                    <p>No pending applications.</p>
                </div>
            ) : (
                <div className={styles.tableWrapper} style={{ marginBottom: '3rem' }}>
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
                                    <td className={styles.money}>{Number(loan.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
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
                                    <td className={styles.money}>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ color: '#22c55e', fontSize: '0.8rem' }}>+ {repaid.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                            <div style={{ width: '80px', height: '4px', background: '#333', borderRadius: '2px' }}>
                                                <div style={{ width: `${percent}%`, height: '100%', background: '#22c55e' }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ color: '#ef4444' }}>{remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                    <td><span className={`${styles.badge} ${styles[loan.status]}`}>{loan.status}</span></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}