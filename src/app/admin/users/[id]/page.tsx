import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/get-settings";
import BalanceAdjuster from "@/components/admin/users/[id]/BalanceAdjuster";
import UserActions from "@/components/admin/users/[id]/UserActions";
import IssueCardButton from "@/components/admin/users/[id]/IssueCardButton";
import WireManager from "@/components/admin/users/[id]/WireManager";
import KycReviewSection from "@/components/admin/users/[id]/KycReviewSection";
import LocalTransferList from "@/components/admin/users/[id]/LocalTransferList";

import { CreditCard, Activity, User, MapPin, HeartHandshake, History, Wallet, ArrowLeft, ArrowRightLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../../../components/admin/users/[id]/users.module.css"

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await requireAdmin();

    const settings = await getSiteSettings();

    const user = await db.user.findUnique({
        where: { id },
        include: {
            accounts: true,
            cards: { orderBy: { createdAt: 'desc' } },
            wireTransfers: { orderBy: { createdAt: 'desc' }, take: 5 }
        }
    });

    if (!user) return notFound();

    const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString() : 'N/A';

    return (
        <div className={styles.container}>
            {/* NAV BACK */}
            <Link href="/admin/users" className={styles.backLink}>
                <ArrowLeft size={16} /> Back to Users
            </Link>

            {/* HEADER WITH ACTIONS */}
            <header className={styles.detailHeader}>
                <div>
                    <div className={styles.headerTitleRow}>
                        <h1 className={styles.title}>{user.fullName}</h1>
                        <span className={`${styles.badge} ${styles[user.role]}`}>{user.role}</span>
                        <span className={`${styles.kycBadge} ${styles[user.kycStatus]}`}>
                            {user.kycStatus.replace('_', ' ')}
                        </span>
                    </div>
                    <p className={styles.subtitle}>ID: {user.id}</p>
                    <p className={styles.subtitle}>Joined: {formatDate(user.createdAt)}</p>
                </div>
                <UserActions userId={user.id} status={user.status} siteName={settings.site_name} />
            </header>

            <div className={styles.grid}>

                {/* COLUMN 1: FINANCIALS */}
                <div className={styles.col}>

                    {/* KYC REVIEW SECTION */}
                    <KycReviewSection user={user} />

                    {/* 1. ACCOUNTS & BALANCES */}
                    <div className={styles.section}>
                        <div className={styles.secHeaderRow}>
                            <h3 className={styles.secTitle}><Wallet size={18} /> Accounts</h3>
                            <Link href={`/admin/users/${user.id}/transactions`} className={styles.viewBtn}>
                                <History size={14} /> View History
                            </Link>
                        </div>

                        <div className={styles.accountsList}>
                            {user.accounts.map(acc => (
                                <div key={acc.id} className={styles.accCard}>
                                    <div className={styles.accInfo}>
                                        <h4>{acc.type.replace('_', ' ')} <span className={styles.tiny}>({acc.accountNumber})</span></h4>
                                        <div className={styles.accBal}>
                                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(acc.availableBalance))}
                                        </div>
                                    </div>
                                    <BalanceAdjuster accountId={acc.id} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. WIRE TRANSFERS */}
                    <div className={styles.section}>
                        <h3 className={styles.secTitle}><Activity size={18} /> Recent Wires</h3>
                        <WireManager wires={user.wireTransfers} />
                    </div>

                    {/* 3. LOCAL TRANSFERS */}
                    <div className={styles.section}>
                        <h3 className={styles.secTitle}><ArrowRightLeft size={18} /> Recent Local Transfers</h3>
                        <LocalTransferList userId={user.id} />
                    </div>
                </div>

                {/* COLUMN 2: PROFILE DATA & CARDS */}
                <div className={styles.col}>

                    {/* CARDS */}
                    <div className={styles.section}>
                        <div className={styles.secHeaderRow}>
                            <h3 className={styles.secTitle}><CreditCard size={18} /> Cards</h3>
                            <IssueCardButton userId={user.id} />
                        </div>

                        <div className={styles.listContainer}>
                            {user.cards.length === 0 ? <div className={styles.emptySmall}>No cards issued.</div> : user.cards.map(card => (
                                <div key={card.id} className={styles.listItem}>
                                    <div className={styles.flexCenterGap}>
                                        <CreditCard size={16} color="var(--text-secondary)" />
                                        <span>Visa ...<strong>{card.cardNumber.slice(-4)}</strong></span>
                                    </div>
                                    <span className={card.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeRed}>
                                        {card.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PROFILE INFO */}
                    <div className={styles.section}>
                        <h3 className={styles.secTitle}><User size={18} /> Client Profile</h3>

                        {/* A. Personal */}
                        <h4 className={styles.subHeader}>Personal Information</h4>
                        <div className={styles.profileGrid}>
                            <div className={styles.field}><label>Email</label><input disabled defaultValue={user.email} className={styles.input} /></div>
                            <div className={styles.field}><label>Phone</label><input disabled defaultValue={user.phone || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>DOB</label><input disabled defaultValue={formatDate(user.dateOfBirth)} className={styles.input} /></div>
                            <div className={styles.field}><label>Gender</label><input disabled defaultValue={user.gender || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>Occupation</label><input disabled defaultValue={user.occupation || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>PIN</label><input disabled defaultValue={user.transactionPin || 'N/A'} className={styles.input} /></div>
                        </div>

                        {/* B. Address */}
                        <h4 className={styles.subHeader} style={{ marginTop: '1.5rem' }}><MapPin size={14} /> Address</h4>
                        <div className={styles.profileGrid}>
                            <div className={styles.field}><label>Zip</label><input disabled defaultValue={user.zipCode || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>Tax ID / SSN</label><input disabled defaultValue={user.taxId || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>City</label><input disabled defaultValue={user.city || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>Country</label><input disabled defaultValue={user.country || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field} style={{ gridColumn: '1 / -1' }}><label>Street</label><input disabled defaultValue={user.address || 'N/A'} className={styles.input} /></div>
                        </div>

                        {/* C. Next of Kin */}
                        <h4 className={styles.subHeader} style={{ marginTop: '1.5rem' }}><HeartHandshake size={14} /> Next of Kin</h4>
                        <div className={styles.profileGrid}>
                            <div className={styles.field}><label>Name</label><input disabled defaultValue={user.nokName || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>Relation</label><input disabled defaultValue={user.nokRelationship || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>Phone</label><input disabled defaultValue={user.nokPhone || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>Email</label><input disabled defaultValue={user.nokEmail || 'N/A'} className={styles.input} /></div>
                            <div className={styles.field}><label>Address</label><input disabled defaultValue={user.nokAddress || 'N/A'} className={styles.input} /></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}