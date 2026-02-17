import { db } from "@/lib/db";
import LoanDecisionButtons from "@/components/admin/loans/LoanDecisionButtons";
import { requireAdmin } from "@/lib/auth/admin-auth";
import Link from "next/link";
import { ArrowLeft, AlertCircle, PieChart, Banknote } from "lucide-react";
import styles from "../../../components/admin/loans/loans.module.css"
import { UserStatus } from "@prisma/client";

export default async function AdminLoansPage() {
    // 1. Security Check
    await requireAdmin();

    const [pendingLoans, activeLoans, rates] = await Promise.all([
        db.loan.findMany({
            where: {
                status: 'PENDING',
                user: {
                    status: { not: UserStatus.ARCHIVED }
                }
            },
            include: {
                user: { select: { fullName: true, email: true, currency: true } }
            },
            orderBy: { createdAt: 'desc' }
        }),
        db.loan.findMany({
            where: {
                OR: [{ status: 'APPROVED' }, { status: 'PAID' }],
                user: {
                    status: { not: UserStatus.ARCHIVED }
                }
            },
            include: {
                user: { select: { fullName: true, email: true, currency: true } }
            },
            orderBy: { updatedAt: 'desc' }
        }),
        db.exchangeRate.findMany()
    ]);

    const rateMap = new Map(rates.map(r => [r.currency, Number(r.rate)]));

    const getNative = (amount: number, currency: string) => {
        const rate = currency === "USD" ? 1 : (rateMap.get(currency) || 1);
        return amount * rate;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Loan Management</h1>
                    <p className={styles.subtitle}>Review applications and track portfolio performance.</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin" className={styles.backBtn}>
                        <ArrowLeft size={16} /> Dashboard
                    </Link>
                </div>
            </header>

            {/* SECTION 1: PENDING APPROVALS */}
            <div className={styles.sectionHeader}>
                <AlertCircle size={20} className={styles.iconWarning} />
                <h3>Pending Approvals</h3>
            </div>

            {pendingLoans.length === 0 ? (
                <div className={styles.emptyState}>
                    <Banknote size={48} strokeWidth={1} className={styles.emptyIcon} />
                    <p>No pending loan applications.</p>
                </div>
            ) : (
                <div className={styles.tableCard}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Amount Request</th>
                                <th>Term</th>
                                <th>Reason</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingLoans.map(loan => {
                                // @ts-ignore
                                const currency = loan.user.currency || "USD";
                                const nativeAmount = getNative(Number(loan.amount), currency);

                                return (
                                    <tr key={loan.id}>
                                        <td>
                                            <div className={styles.userName}>{loan.user.fullName}</div>
                                            <div className={styles.userEmail}>{loan.user.email}</div>
                                        </td>
                                        <td className={styles.amountCell}>
                                            {nativeAmount.toLocaleString('en-US', { style: 'currency', currency: currency })}
                                            {currency !== 'USD' && <div style={{ fontSize: '0.7rem', color: '#888' }}>Sys: ${Number(loan.amount).toLocaleString()}</div>}
                                        </td>
                                        <td>{loan.termMonths} Months</td>
                                        <td className={styles.reasonCell}>{loan.reason}</td>
                                        <td><LoanDecisionButtons loanId={loan.id} /></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* SECTION 2: ACTIVE PORTFOLIO */}
            <div className={styles.sectionHeader} style={{ marginTop: '3rem' }}>
                <PieChart size={20} className={styles.iconInfo} />
                <h3>Active Portfolio</h3>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Client</th>
                            <th>Total Repayment</th>
                            <th>Repayment Progress</th>
                            <th>Remaining</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeLoans.map(loan => {
                            // @ts-ignore
                            const currency = loan.user.currency || "USD";
                            const rate = currency === "USD" ? 1 : (rateMap.get(currency) || 1);

                            const totalUSD = Number(loan.totalRepayment);
                            const repaidUSD = Number(loan.repaidAmount);
                            const remainingUSD = totalUSD - repaidUSD;
                            const percent = Math.min((repaidUSD / totalUSD) * 100, 100);

                            // Native Values
                            const totalNative = totalUSD * rate;
                            const repaidNative = repaidUSD * rate;
                            const remainingNative = remainingUSD * rate;

                            return (
                                <tr key={loan.id}>
                                    <td>
                                        <div className={styles.userName}>{loan.user.fullName}</div>
                                        <div className={styles.dateText}>Approved: {loan.approvedAt ? new Date(loan.approvedAt).toLocaleDateString() : 'N/A'}</div>
                                    </td>
                                    <td className={styles.amountCell}>
                                        {totalNative.toLocaleString('en-US', { style: 'currency', currency: currency })}
                                    </td>
                                    <td style={{ width: '25%' }}>
                                        <div className={styles.progressContainer}>
                                            <div className={styles.progressLabels}>
                                                <span>{percent.toFixed(0)}%</span>
                                                <span className={styles.repaidText}>+ {repaidNative.toLocaleString('en-US', { style: 'currency', currency: currency })}</span>
                                            </div>
                                            <div className={styles.track}>
                                                <div
                                                    className={styles.bar}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.remainingDebt}>
                                        {remainingNative.toLocaleString('en-US', { style: 'currency', currency: currency })}
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${loan.status === 'PAID' ? styles.badgeSuccess : styles.badgeActive}`}>
                                            {loan.status}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                        {activeLoans.length === 0 && (
                            <tr>
                                <td colSpan={5} className={styles.emptyText}>No active loans found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


// import { db } from "@/lib/db";
// import LoanDecisionButtons from "@/components/admin/loans/LoanDecisionButtons";
// import { requireAdmin } from "@/lib/auth/admin-auth";
// import Link from "next/link";
// import { ArrowLeft, AlertCircle, PieChart, Banknote } from "lucide-react";
// import styles from "../../../components/admin/loans/loans.module.css"
// import { UserStatus } from "@prisma/client";

// export default async function AdminLoansPage() {
//     // 1. Security Check
//     await requireAdmin();

//     // 2. Fetch Pending
//     const pendingLoans = await db.loan.findMany({
//         where: {
//             status: 'PENDING',
//             user: {
//                 status: { not: UserStatus.ARCHIVED }
//             }
//         },
//         include: { user: true },
//         orderBy: { createdAt: 'desc' }
//     });

//     // 3. Fetch Active/Paid
//     const activeLoans = await db.loan.findMany({
//         where: {
//             OR: [{ status: 'APPROVED' }, { status: 'PAID' }],
//             user: {
//                 status: { not: UserStatus.ARCHIVED }
//             }
//         },
//         include: { user: true },
//         orderBy: { updatedAt: 'desc' }
//     });

//     return (
//         <div className={styles.container}>
//             <header className={styles.header}>
//                 <div className={styles.headerContent}>
//                     <h1 className={styles.title}>Loan Management</h1>
//                     <p className={styles.subtitle}>Review applications and track portfolio performance.</p>
//                 </div>
//                 <div className={styles.headerActions}>
//                     <Link href="/admin" className={styles.backBtn}>
//                         <ArrowLeft size={16} /> Dashboard
//                     </Link>
//                 </div>
//             </header>

//             {/* SECTION 1: PENDING APPROVALS */}
//             <div className={styles.sectionHeader}>
//                 <AlertCircle size={20} className={styles.iconWarning} />
//                 <h3>Pending Approvals</h3>
//             </div>

//             {pendingLoans.length === 0 ? (
//                 <div className={styles.emptyState}>
//                     <Banknote size={48} strokeWidth={1} className={styles.emptyIcon} />
//                     <p>No pending loan applications.</p>
//                 </div>
//             ) : (
//                 <div className={styles.tableCard}>
//                     <table className={styles.table}>
//                         <thead>
//                             <tr>
//                                 <th>Applicant</th>
//                                 <th>Amount Request</th>
//                                 <th>Term</th>
//                                 <th>Reason</th>
//                                 <th>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {pendingLoans.map(loan => (
//                                 <tr key={loan.id}>
//                                     <td>
//                                         <div className={styles.userName}>{loan.user.fullName}</div>
//                                         <div className={styles.userEmail}>{loan.user.email}</div>
//                                     </td>
//                                     <td className={styles.amountCell}>
//                                         {Number(loan.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
//                                     </td>
//                                     <td>{loan.termMonths} Months</td>
//                                     <td className={styles.reasonCell}>{loan.reason}</td>
//                                     <td><LoanDecisionButtons loanId={loan.id} /></td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             {/* SECTION 2: ACTIVE PORTFOLIO */}
//             <div className={styles.sectionHeader} style={{ marginTop: '3rem' }}>
//                 <PieChart size={20} className={styles.iconInfo} />
//                 <h3>Active Portfolio</h3>
//             </div>

//             <div className={styles.tableCard}>
//                 <table className={styles.table}>
//                     <thead>
//                         <tr>
//                             <th>Client</th>
//                             <th>Total Repayment</th>
//                             <th>Repayment Progress</th>
//                             <th>Remaining</th>
//                             <th>Status</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {activeLoans.map(loan => {
//                             const total = Number(loan.totalRepayment);
//                             const repaid = Number(loan.repaidAmount);
//                             const remaining = total - repaid;
//                             const percent = Math.min((repaid / total) * 100, 100);

//                             return (
//                                 <tr key={loan.id}>
//                                     <td>
//                                         <div className={styles.userName}>{loan.user.fullName}</div>
//                                         <div className={styles.dateText}>Approved: {loan.approvedAt ? new Date(loan.approvedAt).toLocaleDateString() : 'N/A'}</div>
//                                     </td>
//                                     <td className={styles.amountCell}>
//                                         {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
//                                     </td>
//                                     <td style={{ width: '25%' }}>
//                                         <div className={styles.progressContainer}>
//                                             <div className={styles.progressLabels}>
//                                                 <span>{percent.toFixed(0)}%</span>
//                                                 <span className={styles.repaidText}>+ {repaid.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
//                                             </div>
//                                             <div className={styles.track}>
//                                                 <div
//                                                     className={styles.bar}
//                                                     style={{ width: `${percent}%` }}
//                                                 ></div>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className={styles.remainingDebt}>
//                                         {remaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
//                                     </td>
//                                     <td>
//                                         <span className={`${styles.badge} ${loan.status === 'PAID' ? styles.badgeSuccess : styles.badgeActive}`}>
//                                             {loan.status}
//                                         </span>
//                                     </td>
//                                 </tr>
//                             )
//                         })}
//                         {activeLoans.length === 0 && (
//                             <tr>
//                                 <td colSpan={5} className={styles.emptyText}>No active loans found.</td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// }