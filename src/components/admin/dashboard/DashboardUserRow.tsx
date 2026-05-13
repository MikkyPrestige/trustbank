"use client";

import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import styles from "./dashboardUserRow.module.css";

interface Props {
    user: User & { accounts: any[] };
    exchangeRate?: number;
}

export default function DashboardUserRow({ user, exchangeRate = 1 }: Props) {
    const router = useRouter();

    const totalBalUSD = user.accounts.reduce((sum, acc) => sum + Number(acc.availableBalance), 0);

    // @ts-ignore
    const currency = user.currency || "USD";
    const convertedBal = totalBalUSD * exchangeRate;

    const renderKycIcon = () => {
        if (user.kycStatus === 'VERIFIED') {
            return (
                <div title="Verified" className={styles.kycVerified}>
                    <CheckCircle size={20} />
                </div>
            );
        }
        if (user.kycStatus === 'PENDING') {
            return (
                <div title="Pending Review" className={styles.kycPending}>
                    <Clock size={20} />
                </div>
            );
        }
        return (
            <div title="Not Submitted / Failed" className={styles.kycFailed}>
                <XCircle size={20} />
            </div>
        );
    };

    return (
        <tr
            className={styles.clickableRow}
            onClick={() => router.push(`/admin/users/${user.id}`)}
        >
            <td>
                <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.fullName}</span>
                    <span className={styles.userDate}>
                        {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </td>
            <td className={styles.userEmail}>{user.email}</td>
            <td>
                <span className={`${styles.statusBadge} ${user.status === 'ACTIVE' ? styles.statusActive : styles.statusInactive}`}>
                    {user.status}
                </span>
            </td>
            <td className={styles.kycCell}>
                {renderKycIcon()}
            </td>
            <td>
                <div className={styles.balanceContainer}>
                    <span className={styles.balancePrimary}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(convertedBal)}
                    </span>

                    {currency !== 'USD' && (
                        <span className={styles.balanceSecondary}>
                            ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalUSD)}
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
}