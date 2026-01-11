// components/DashboardView.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ArrowUpRight,
    ArrowDownLeft,
    Send,
    Globe,
    CreditCard as CardIcon,
    Plus,
    MoreHorizontal,
    Eye,
    EyeOff,
    User
} from "lucide-react";
import styles from "../app/dashboard/dashboard.module.css";

interface DashboardViewProps {
    user: any;
    totalBalance: number;
    beneficiaries: any[]; // 👈 Added prop type
}

export default function DashboardView({ user, totalBalance, beneficiaries }: DashboardViewProps) {
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const displayMoney = (amount: number) => {
        if (!isVisible) return "••••••";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const displayCardNumber = (num: string) => {
        if (!isVisible) return "•••• •••• •••• ••••";
        return `•••• •••• •••• ${num.slice(-4)}`;
    };

    const primaryAccount = user.accounts[0];

    return (
        <div className={styles.container}>

            {/* TOP BAR */}
            <div className={styles.topBar}>
                <div>
                    <h1 className={styles.welcome}>Good {new Date().getHours() < 12 ? "Morning" : "Evening"}, {user.fullName.split(' ')[0]}</h1>
                    <p className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={toggleVisibility}
                        className={styles.privacyBtn}
                        title={isVisible ? "Hide Balance" : "Show Balance"}
                    >
                        {isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>

                    <div className={styles.userAvatar}>
                        {user.fullName.charAt(0)}
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className={styles.quickActionsBar}>
                <Link href="/dashboard/transfer" className={styles.actionItem}>
                    <div className={styles.actionIcon}><Send size={20} /></div>
                    <span>Transfer</span>
                </Link>
                <Link href="/dashboard/wire" className={styles.actionItem}>
                    <div className={styles.actionIcon}><Globe size={20} /></div>
                    <span>Wire</span>
                </Link>
                <Link href="/dashboard/cards" className={styles.actionItem}>
                    <div className={styles.actionIcon}><CardIcon size={20} /></div>
                    <span>Cards</span>
                </Link>
                <div style={{ position: 'relative' }}>
                    <button
                        className={styles.actionItem}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                        <div className={`${styles.actionIcon} ${styles.actionMore}`}>
                            <MoreHorizontal size={20} />
                        </div>
                        <span>More</span>
                    </button>

                    {showMoreMenu && (
                        <div className={styles.moreDropdown}>
                            <Link href="/dashboard/loans" className={styles.dropItem}><span>Loans</span></Link>
                            <Link href="/dashboard/crypto" className={styles.dropItem}><span>Crypto</span></Link>
                            <Link href="/dashboard/settings" className={styles.dropItem}><span>Settings</span></Link>
                            <div className={styles.dropDivider}></div>
                            <Link href="/dashboard/beneficiaries" className={styles.dropItem}><span>Beneficiaries</span></Link>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.mainGrid}>
                {/* LEFT COLUMN */}
                <div className={styles.leftCol}>
                    <div className={styles.liquidityCard}>
                        <div className={styles.liquidityLabel}>Total Liquidity</div>
                        <h2 className={styles.totalAmount}>{displayMoney(totalBalance)}</h2>
                        <div className={styles.liquidityTrend}>
                            <span className={styles.trendPositive}>+2.4%</span> vs last month
                        </div>
                    </div>

                    <div className={styles.sectionHeader}>
                        <h3>Accounts</h3>
                    </div>
                    <div className={styles.accountList}>
                        {user.accounts.map((acc: any) => (
                            <div key={acc.id} className={styles.accountRow}>
                                <div className={styles.accInfo}>
                                    <div className={styles.accIcon}>{acc.type.charAt(0)}</div>
                                    <div>
                                        <p className={styles.accName}>{acc.type} Account</p>
                                        <p className={styles.accNum}>
                                            {isVisible ? `•••• ${acc.accountNumber.slice(-4)}` : '•••• ••••'}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.accBal}>
                                    {displayMoney(Number(acc.availableBalance))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>Recent Transactions</h3>
                        <Link href="/dashboard/transactions" className={styles.viewAll}>View All</Link>
                    </div>
                    <div className={styles.activityFeed}>
                        {user.accounts.flatMap((a: any) => a.ledgerEntries).length === 0 ? (
                            <div className={styles.emptyState}>No recent activity</div>
                        ) : (
                            user.accounts
                                .flatMap((a: any) => a.ledgerEntries)
                                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .slice(0, 5)
                                .map((tx: any) => (
                                    <div key={tx.id} className={styles.txRow}>
                                        <div className={styles.txLeft}>
                                            <div className={`${styles.txIcon} ${tx.direction === 'CREDIT' ? styles.iconCredit : styles.iconDebit}`}>
                                                {tx.direction === 'CREDIT' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                            </div>
                                            <div className={styles.txDetails}>
                                                <p className={styles.txDesc}>{tx.description || 'Transfer'}</p>
                                                <p className={styles.txDate}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={`${styles.txAmount} ${tx.direction === 'CREDIT' ? styles.amtCredit : styles.amtDebit}`}>
                                            {tx.direction === 'CREDIT' ? '+' : '-'}
                                            {displayMoney(Number(tx.amount)).replace('+', '').replace('-', '')}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className={styles.rightCol}>

                    {/* 👇 NEW: QUICK SEND WIDGET */}
                    <div className={styles.sectionHeader}>
                        <h3>Quick Send</h3>
                        <Link href="/dashboard/beneficiaries"><Plus size={18} /></Link>
                    </div>
                    <div className={styles.quickSendWidget}>
                        {beneficiaries.length === 0 ? (
                            <div className={styles.emptyBeneficiary}>
                                <p>No saved contacts.</p>
                                <Link href="/dashboard/beneficiaries" className={styles.addBenLink}>Add One</Link>
                            </div>
                        ) : (
                            <div className={styles.beneficiaryScroll}>
                                <Link href="/dashboard/transfer" className={styles.addBenCircle}>
                                    <Plus size={20} />
                                </Link>
                                {beneficiaries.map(ben => (
                                    <Link href={`/dashboard/wire?beneficiaryId=${ben.id}`} key={ben.id} className={styles.benCircle} title={ben.accountName}>
                                        <div className={styles.benAvatar}>
                                            {ben.accountName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={styles.benName}>{ben.accountName.split(' ')[0]}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.sectionHeader} style={{ marginTop: '2rem' }}>
                        <h3>My Card</h3>
                        <Link href="/dashboard/cards"><Plus size={18} /></Link>
                    </div>

                    <div className={styles.visaCard}>
                        <div className={styles.cardGlass}></div>
                        <div className={styles.cardTop}>
                            <span className={styles.bankName}>TrustBank</span>
                            <span className={styles.cardType}>Visa Infinite</span>
                        </div>
                        <div className={styles.chip}></div>
                        <div className={styles.cardNumber}>
                            {primaryAccount ? displayCardNumber(primaryAccount.accountNumber) : '•••• •••• •••• 0000'}
                        </div>
                        <div className={styles.cardBottom}>
                            <div className={styles.cardHolder}>
                                <span>Card Holder</span>
                                <p>{user.fullName.toUpperCase()}</p>
                            </div>
                            <div className={styles.cardExpires}>
                                <span>Expires</span>
                                <p>12/28</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.promoCard}>
                        <div className={styles.promoIcon}>
                            <Globe size={24} color="#3b82f6" />
                        </div>
                        <h4>International Transfer</h4>
                        <p>Send money abroad with 0% fees this week.</p>
                        <Link href="/dashboard/wire" className={styles.promoBtn}>Send Now</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}