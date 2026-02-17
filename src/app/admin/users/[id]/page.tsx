export const dynamic = 'force-dynamic';

import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import BalanceAdjuster from "@/components/admin/users/[id]/BalanceAdjuster";
import UserActions from "@/components/admin/users/[id]/UserActions";
import IssueCardButton from "@/components/admin/users/[id]/IssueCardButton";
import WireManager from "@/components/admin/users/[id]/WireManager";
import KycReviewSection from "@/components/admin/users/[id]/KycReviewSection";
import LocalTransferList from "@/components/admin/users/[id]/LocalTransferList";
import ActivityLog from "@/components/admin/users/[id]/ActivityLog";
import RevokeSessionButton from "@/components/admin/users/[id]/RevokeSessionButton";

import { CreditCard, Activity, User, MapPin, HeartHandshake, History, Wallet, ArrowLeft, ArrowRightLeft, ShieldAlert, Lock, Mail, Phone, Briefcase, Calendar, Hash, AlertTriangle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../../../components/admin/users/[id]/users.module.css"

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await requireAdmin();
    const settings = await getSiteSettings();
    const MAX_ATTEMPTS = settings.auth_login_limit || 5;

    // 1. Fetch User & Notifications
    const user = await db.user.findUnique({
        where: { id },
        include: {
            accounts: true,
            cards: { orderBy: { createdAt: 'desc' } },
            wireTransfers: { orderBy: { createdAt: 'desc' }, take: 5 },
            Notification: { orderBy: { createdAt: 'desc' }, take: 20 }
        }
    });

    if (!user) return notFound();

    // 2. Fetch Exchange Rate for User's Currency
    const currency = user.currency || "USD";
    let exchangeRate = 1;

    if (currency !== "USD") {
        const rateData = await db.exchangeRate.findUnique({ where: { currency } });
        if (rateData) exchangeRate = Number(rateData.rate);
    }

    // 3. Fetch Security Logs (Spy Mode)
    const securityLogs = await db.adminLog.findMany({
        where: {
            targetId: user.email,
            action: { in: ['LOGIN_FAILED', 'IP_BLOCKED', 'ACCOUNT_LOCKED'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    // 4. Merge & Sort the Feed
    const unifiedFeed = [
        ...user.Notification.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
            icon: 'bell'
        })),
        ...securityLogs.map(l => {
            let cleanMsg = l.metadata || 'Security Event';
            try {
                if (cleanMsg.startsWith('{')) {
                    const parsed = JSON.parse(cleanMsg);
                    cleanMsg = parsed.reason || cleanMsg;
                }
            } catch (e) { }

            return {
                id: l.id,
                type: l.level === 'WARNING' ? 'WARNING' : l.level === 'CRITICAL' ? 'CRITICAL' : 'INFO',
                title: l.action.replace(/_/g, ' '),
                message: `${cleanMsg} (IP: ${l.ipAddress || 'Unknown'})`,
                createdAt: l.createdAt,
                icon: 'shield'
            };
        })
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const lastActivity = unifiedFeed[0]?.createdAt;
    const timeDiff = lastActivity ? new Date().getTime() - lastActivity.getTime() : Infinity;
    const isActiveNow = timeDiff < 1000 * 60 * 15; // 15 Minutes

    const isLocked = !!(
        (user.pinLockedUntil && new Date() < user.pinLockedUntil) ||
        (user.failedLoginAttempts >= MAX_ATTEMPTS)
    );

    const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString() : 'N/A';

    return (
        <div className={styles.container}>
            <Link href="/admin/users" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Users
            </Link>

            <header className={styles.detailHeader}>
                <div>
                    <div className={styles.headerTitleRow}>
                        <h1 className={styles.title}>{user.fullName}</h1>
                        <span className={`${styles.badge} ${styles[user.role]}`}>{user.role}</span>
                        <span className={`${styles.kycBadge} ${styles[user.kycStatus]}`}>
                            {user.kycStatus.replace('_', ' ')}
                        </span>
                        {isLocked && (
                            <span className={`${styles.badge} ${styles.lockedBadge}`}>
                                <Lock size={10} /> LOCKED
                            </span>
                        )}
                        {/* Currency Tag */}
                        <span className={`${styles.badge}`} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--primary', border: '1px solid var(--border)' }}>
                            {currency}
                        </span>
                    </div>
                    <p className={styles.subtitle}>ID: {user.id}</p>
                    <p className={styles.subtitle}>Joined: {formatDate(user.createdAt)}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <RevokeSessionButton userId={user.id} userName={user.fullName} />

                    <UserActions
                        userId={user.id}
                        status={user.status}
                        siteName={settings.site_name}
                        isLocked={isLocked}
                    />
                </div>
            </header>

            {/* --- TOP ROW: IDENTITY & NEXT OF KIN --- */}
            <div className={styles.identityGrid}>
                <div className={styles.section}>
                    <h3 className={styles.secTitle}><User size={18} /> Client Profile</h3>
                    <div className={styles.profileGridDense}>
                        <div className={styles.field}>
                            <label><Mail size={12} /> Email</label>
                            <input disabled defaultValue={user.email} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label><Phone size={12} /> Phone</label>
                            <input disabled defaultValue={user.phone || 'N/A'} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label><Briefcase size={12} /> Occupation</label>
                            <input disabled defaultValue={user.occupation || 'N/A'} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label><Calendar size={12} /> Date of Birth</label>
                            <input disabled defaultValue={formatDate(user.dateOfBirth)} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label><User size={12} /> Gender</label>
                            <input disabled defaultValue={user.gender || 'N/A'} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label><Hash size={12} /> Tax ID</label>
                            <input disabled defaultValue={user.taxId || 'N/A'} className={styles.input} />
                        </div>
                    </div>

                    <h4 className={styles.subHeader} style={{ marginTop: '1.5rem' }}><MapPin size={14} /> Address</h4>
                    <div className={styles.addressBox}>
                        {user.address || 'No street address provided'}<br />
                        {user.city}, {user.state} {user.zipCode}<br />
                        {user.country}
                    </div>
                </div>

                {/* 2. Next of Kin */}
                <div className={styles.section}>
                    <h3 className={styles.secTitle}><HeartHandshake size={18} /> Next of Kin</h3>
                    <div className={styles.profileGridDense}>
                        <div className={styles.field}>
                            <label>Full Name</label>
                            <input disabled defaultValue={user.nokName || 'N/A'} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label>Relationship</label>
                            <input disabled defaultValue={user.nokRelationship || 'N/A'} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label>Phone</label>
                            <input disabled defaultValue={user.nokPhone || 'N/A'} className={styles.input} />
                        </div>
                        <div className={styles.field}>
                            <label>Email</label>
                            <input disabled defaultValue={user.nokEmail || 'N/A'} className={styles.input} />
                        </div>
                        <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
                            <label>Address</label>
                            <input disabled defaultValue={user.nokAddress || 'N/A'} className={styles.input} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM ROW: DASHBOARD GRID --- */}
            <div className={styles.dashboardWrapper}>
                {/* COL 1: FINANCIALS */}
                <div className={styles.col}>
                    <div className={styles.section}>
                        <div className={styles.secHeaderRow}>
                            <h3 className={styles.secTitle}><Wallet size={18} /> Accounts</h3>
                            <Link href={`/admin/users/${user.id}/transactions`} className={styles.viewBtn}>
                                <History size={14} /> History
                            </Link>
                        </div>
                        <div className={styles.accountsList}>
                            {user.accounts.map(acc => {
                                // Conversion Logic
                                const balanceUSD = Number(acc.availableBalance);
                                const converted = balanceUSD * exchangeRate;

                                return (
                                    <div key={acc.id} className={styles.accCard}>
                                        <div className={styles.accInfo}>
                                            <h4>{acc.type.replace('_', ' ')} <span className={styles.tiny}>({acc.accountNumber})</span></h4>
                                            <div className={styles.accBal}>
                                                {/* Main Converted Balance */}
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(converted)}

                                                {/* Subtitle USD Balance */}
                                                {currency !== "USD" && (
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                                        ≈ {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balanceUSD)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <BalanceAdjuster
                                            accountId={acc.id}
                                            currency={currency}
                                            rate={exchangeRate}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.secTitle}><Activity size={18} /> Recent Wires</h3>
                        <WireManager
                            wires={user.wireTransfers}
                            currency={currency}
                            rate={exchangeRate}
                        />
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.secTitle}><ArrowRightLeft size={18} /> Local Transfers</h3>
                        <LocalTransferList
                            userId={user.id}
                            currency={currency}
                            rate={exchangeRate}
                        />
                    </div>
                </div>

                {/* COL 2: SECURITY & ADMIN */}
                <div className={styles.col}>
                    <KycReviewSection user={user} />

                    <div className={styles.section}>
                        <div className={styles.secHeaderRow}>
                            <h3 className={styles.secTitle}><CreditCard size={18} /> Cards</h3>
                            <IssueCardButton userId={user.id} />
                        </div>
                        <div className={styles.listContainer}>
                            {user.cards.length === 0 ? <div className={styles.emptySmall}>No cards issued.</div> : user.cards.map(card => (
                                <div key={card.id} className={styles.listItem}>
                                    <div className={styles.flexCenterGap}>
                                        <CreditCard size={16} color="var(--text-muted)" />
                                        <span>Visa ...<strong>{card.cardNumber.slice(-4)}</strong></span>
                                    </div>
                                    <span className={card.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeRed}>
                                        {card.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${styles.section} ${styles.fixedLogHeight}`}>
                        <div className={styles.secHeaderRow}>
                            <h3 className={styles.secTitle}>
                                <ShieldAlert size={18} /> Security Feed
                            </h3>
                            {isActiveNow ? (
                                <span className={`${styles.liveBadge} ${styles.activeBadge}`}>
                                    <AlertTriangle size={12} strokeWidth={3} /> ACTIVE NOW
                                </span>
                            ) : (
                                <span className={styles.liveBadge}>IDLE</span>
                            )}
                        </div>

                        <div className={styles.scrollContainer}>
                            {/* @ts-ignore */}
                            <ActivityLog logs={unifiedFeed} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}