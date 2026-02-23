"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    ArrowUpRight, ArrowDownLeft, Send, Globe, CreditCard as CardIcon,
    Plus, MoreHorizontal, Eye, EyeOff, Copy, Check, AlertTriangle, Wifi, Repeat, Banknote, Lock, X, UserCog, Landmark, XCircle, Activity
} from "lucide-react";
import toast from "react-hot-toast";
import BalanceCard from "./BalanceCard";
import NotificationDropdown from "./NotificationDropdown";
import DashboardBanner from "./DashboardBanner";
import PromoSidebar from "./PromoSidebar";
import styles from "../dashboard.module.css";

interface DashboardViewProps {
    user: any;
    totalBalance: number;
    beneficiaries: any[];
    trend: number;
    settings: any;
    currencyCode: string;
    exchangeRate: number;
}

export default function DashboardView({
    user,
    totalBalance,
    beneficiaries,
    trend,
    settings,
    currencyCode,
    exchangeRate
}: DashboardViewProps) {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showMore, setShowMore] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Account Number Copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const displayMoney = (amount: number) => {
        if (!isVisible) return "••••••";

        const converted = amount * exchangeRate;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode
        }).format(converted);
    };

    const activeCard = user.cards && user.cards.length > 0 ? user.cards[0] : null;
    const primaryAccount = user.accounts && user.accounts.length > 0 ? user.accounts[0] : null;

    const displayCardNumber = (num: string) => {
        if (!isVisible) return "•••• •••• •••• ••••";
        const clean = num.replace(/\D/g, '');
        return clean.match(/.{1,4}/g)?.join(' ') || clean;
    };

    const isFrozen = user.status === 'FROZEN';

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.greeting}>
                    <h1>{greeting}, {user.fullName.split(' ')[0]}</h1>
                    <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.iconBtn} onClick={toggleVisibility}>
                        {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                    <NotificationDropdown />
                </div>
            </header>

            {isFrozen && (
                <div className={styles.frozenWrapper}>
                    <div className={styles.frozenBanner}>
                        <AlertTriangle size={24} strokeWidth={2.5} />
                        <div className={styles.frozenContent}>
                            <strong>Account Frozen</strong>
                            <span>Your account is temporarily locked for security. Please contact support.</span>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.dashboardBanner}>
                <DashboardBanner
                    show={settings.dashboard_alert_show === "true"}
                    type={settings.dashboard_alert_type}
                    message={settings.dashboard_alert_msg}
                />
            </div>

            <div className={styles.mainGrid}>
                <div className={styles.leftCol}>
                    <BalanceCard
                        totalBalance={totalBalance}
                        accountName={user.fullName}
                        accountNumber={primaryAccount?.accountNumber || "N/A"}
                        routingNumber={primaryAccount?.routingNumber}
                        trend={trend}
                        status={user.status}
                        bankName={settings.site_name}
                        currencyCode={currencyCode}
                        exchangeRate={exchangeRate}
                    />

                    {/* ACCOUNTS LIST */}
                    <div className={`${styles.sectionHeader} ${styles.sectionSpacer}`}>
                        <h3>Your Accounts</h3>
                    </div>
                    <div className={styles.accountList}>
                        {user.accounts.map((acc: any) => (
                            <div key={acc.id} className={styles.accountRow}>
                                <div className={styles.accInfo}>
                                    <div className={styles.accIcon}>{acc.type.charAt(0)}</div>
                                    <div>
                                        <p className={styles.accName}>{acc.type} Account</p>
                                        <div className={styles.accNumWrapper}>
                                            <p className={styles.accNum}>
                                                {isVisible ? acc.accountNumber : `•••• ${acc.accountNumber.slice(-4)}`}
                                            </p>
                                            {isVisible && (
                                                <button onClick={() => copyToClipboard(acc.accountNumber, acc.id)} className={styles.copyBtn}>
                                                    {copiedId === acc.id ? <Check size={14} className={styles.iconSuccess} /> : <Copy size={14} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.accBal}>
                                    <div className={styles.balWrapper}>
                                        <span className={styles.balMain}>{displayMoney(Number(acc.availableBalance))}</span>
                                        <span className={`${styles.balLabel} ${styles.textSuccess}`}>Available</span>
                                    </div>
                                    <div className={styles.balWrapper}>
                                        <span className={styles.balSub}>
                                            {displayMoney(Number(acc.currentBalance))}
                                        </span>
                                        <span className={styles.balLabel}>Current</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* TRANSACTIONS TABLE */}
                    <div className={styles.sectionHeader}>
                        <h3>Recent Activity</h3>
                        <Link href="/dashboard/transactions" className={styles.linkPrimary}>
                            View All
                        </Link>
                    </div>

                    <div className={`${styles.tableWrapper} ${styles.noMargin}`}>
                        <table className={styles.table}>
                            <tbody>
                                {user.accounts.flatMap((a: any) => a.ledgerEntries).length === 0 ? (
                                    <tr><td colSpan={3} className={styles.emptyState}>No recent activity</td></tr>
                                ) : (
                                    user.accounts.flatMap((a: any) => a.ledgerEntries)
                                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .slice(0, 5)
                                        .map((tx: any) => {
                                            const isReversed = tx.status === 'REVERSED';
                                            const isFailed = tx.status === 'FAILED' || tx.status === 'REJECTED';

                                            return (
                                                <tr
                                                    key={tx.id}
                                                    onClick={() => router.push(`/dashboard/transactions/${tx.id}`)}
                                                    className={styles.clickableRow}
                                                >
                                                    <td>
                                                        <div className={styles.txRow}>
                                                            <div className={`${styles.txIcon} ${isReversed ? styles.txIconReversed :
                                                                isFailed ? styles.txIconFailed :
                                                                    tx.direction === 'CREDIT' ? styles.txIconCredit : styles.txIconDebit
                                                                }`}>
                                                                {isReversed ? <AlertTriangle size={16} /> :
                                                                    isFailed ? <XCircle size={16} /> :
                                                                        tx.direction === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                            </div>

                                                            <div className={styles.txDescWrapper}>
                                                                <span className={`${styles.txDesc} ${isReversed ? styles.textReversed :
                                                                    isFailed ? styles.textFailed : ''
                                                                    }`}>
                                                                    {tx.description || 'Transfer'}
                                                                </span>

                                                                {isReversed && <span className={styles.badgeReversed}>SECURITY REVERSAL</span>}
                                                                {isFailed && <span className={styles.badgeFailed}>DECLINED</span>}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className={styles.txDate}>
                                                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </td>
                                                    <td className={`${styles.txAmount} ${isReversed ? styles.amountReversed :
                                                        isFailed ? styles.amountFailed :
                                                            tx.direction === 'CREDIT' ? styles.amountPositive : styles.amountNegative
                                                        }`}>
                                                        {tx.direction === 'CREDIT' ? '+' : '-'}{displayMoney(Number(tx.amount)).replace(currencyCode === 'USD' ? '$' : '', '')}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.rightCol}>
                    <PromoSidebar
                        title={settings.dashboard_promo_title}
                        desc={settings.dashboard_promo_desc}
                        rate={settings.rate_hysa_apy}
                        btnLabel={settings.dashboard_promo_btn}
                        href={settings.dashboard_promo_link}
                    />
                    <div className={styles.actionsGrid}>
                        <Link href="/dashboard/transfer" className={styles.quickAction}>
                            <div className={styles.actionIcon}><Send size={18} /></div>
                            <span className={styles.actionLabel}>Transfer</span>
                        </Link>

                        <Link href="/dashboard/wire" className={styles.quickAction}>
                            <div className={styles.actionIcon}><Globe size={18} /></div>
                            <span className={styles.actionLabel}>Wire</span>
                        </Link>

                        <Link href="/dashboard/crypto" className={styles.quickAction}>
                            <div className={styles.actionIcon}><Repeat size={18} /></div>
                            <span className={styles.actionLabel}>Exchange</span>
                        </Link>

                        <Link href="/dashboard/cards" className={styles.quickAction}>
                            <div className={styles.actionIcon}><CardIcon size={18} /></div>
                            <span className={styles.actionLabel}>Cards</span>
                        </Link>

                        <Link href="/dashboard/bills" className={styles.quickAction}>
                            <div className={styles.actionIcon}><Banknote size={18} /></div>
                            <span className={styles.actionLabel}>Bills</span>
                        </Link>

                        <div className={styles.quickAction} onClick={() => setShowMore(true)}>
                            <div className={styles.actionIcon}><MoreHorizontal size={18} /></div>
                            <span className={styles.actionLabel}>More</span>
                        </div>

                        {showMore && (
                            <div className={styles.moreOverlay}>
                                <Link href="/dashboard/wire/status" className={styles.moreAction}>
                                    <Activity size={20} className={styles.actionIcon} />
                                    <span className={styles.actionLabel}>Track Wire</span>
                                </Link>

                                <Link href="/dashboard/loans" className={styles.moreAction}>
                                    <Landmark size={20} className={styles.actionIcon} />
                                    <span className={styles.actionLabel}>Loans</span>
                                </Link>

                                <Link href="/dashboard/settings" className={styles.moreAction}>
                                    <UserCog size={20} className={styles.actionIcon} />
                                    <span className={styles.actionLabel}>Settings</span>
                                </Link>

                                <button onClick={() => setShowMore(false)} className={`${styles.moreAction} ${styles.closeMenuBtn}`}>
                                    <X size={16} /> Close
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`${styles.sectionHeader} ${styles.sectionSpacerSmall}`}>
                        <h3>Quick Send</h3>
                    </div>
                    <div className={styles.quickSendWidget}>
                        {!isFrozen && (
                            <Link href="/dashboard/beneficiaries" className={styles.addBenCircle}>
                                <Plus size={24} />
                            </Link>
                        )}

                        {beneficiaries.map(ben => (
                            <Link
                                href={ben.swiftCode ? `/dashboard/wire?beneficiaryId=${ben.id}` : `/dashboard/transfer?beneficiaryId=${ben.id}`}
                                key={ben.id}
                                className={styles.benCircle}
                            >
                                <div className={styles.benAvatar}>
                                    {ben.image ? (
                                        <Image
                                            src={ben.image}
                                            alt={ben.accountName}
                                            width={48}
                                            height={48}
                                            className={styles.benAvatarImg}
                                        />
                                    ) : (
                                        ben.accountName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className={styles.benName}>{ben.accountName.split(' ')[0]}</span>
                            </Link>
                        ))}
                    </div>

                    <div className={`${styles.sectionHeader} ${styles.sectionSpacer}`}>
                        <h3>My Card</h3>
                    </div>
                    {activeCard ? (
                        <div className={`${styles.visaCard} ${activeCard.status === 'FROZEN' ? styles.cardFrozen : ''}`}>
                            <div className={styles.cardTexture}></div>
                            <div className={styles.cardShine}></div>

                            <div className={styles.cardTop}>
                                <span className={styles.bankLogo}>
                                    {settings.site_name ? settings.site_name.toUpperCase() : 'TRUST BANK'}
                                </span>
                                <Wifi size={24} className={styles.contactless} color="rgba(255,255,255,0.7)" />
                            </div>

                            <div className={styles.chip}></div>

                            <div className={styles.cardNumber}>
                                {displayCardNumber(activeCard.cardNumber)}
                            </div>

                            <div className={styles.cardBottom}>
                                <div>
                                    <span className={styles.cardLabelSmall}>CARD HOLDER</span>
                                    <span className={styles.cardValueSmall}>{user.fullName}</span>
                                </div>
                                <div>
                                    <span className={styles.cardLabelSmall}>EXPIRES</span>
                                    <span className={styles.cardValueSmall}>{activeCard.expiryDate}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href="/dashboard/cards" className={styles.visaCardEmpty}>
                            <div className={styles.visaCardEmptyContent}>
                                <Lock size={32} style={{ marginBottom: '10px' }} />
                                <span style={{ fontWeight: 600 }}>No Active Card</span>
                                <span style={{ fontSize: '0.8rem' }}>Tap to request one</span>
                            </div>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}