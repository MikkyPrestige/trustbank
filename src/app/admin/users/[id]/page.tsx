import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BalanceAdjuster from "./BalanceAdjuster";
import UserActions from "./UserActions";
import IssueCardButton from "./IssueCardButton";
import WireManager from "./WireManager";
import styles from "../users.module.css";
import { CreditCard, Activity, User, MapPin, HeartHandshake } from "lucide-react";

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') redirect("/dashboard");

    const user = await db.user.findUnique({
        where: { id },
        include: {
            accounts: true,
            cards: { orderBy: { createdAt: 'desc' } },
            wireTransfers: { orderBy: { createdAt: 'desc' } }
        }
    });

    if (!user) return <div>User not found</div>;

    // Helper to format dates
    const formatDate = (d: Date | null) => d ? new Date(d).toLocaleDateString() : 'N/A';

    return (
        <div className={styles.container}>
            <header className={styles.detailHeader}>
                <div>
                    <h1 className={styles.title}>{user.fullName}</h1>
                    <p className={styles.subtitle}>ID: {user.id}</p>
                    <p className={styles.subtitle} style={{ marginTop: '4px' }}>Joined: {formatDate(user.createdAt)}</p>
                </div>
                <UserActions userId={user.id} status={user.status} />
            </header>

            <div className={styles.grid}>

                {/* 1. FINANCIAL CONTROL */}
                <div className={styles.section}>
                    <h3 className={styles.secTitle}>Financial Control</h3>
                    <div className={styles.accountsList}>
                        {user.accounts.map(acc => (
                            <div key={acc.id} className={styles.accCard}>
                                <div className={styles.accInfo}>
                                    <h4>{acc.type} <span className={styles.tiny}>({acc.accountNumber})</span></h4>
                                    <div className={styles.accBal}>
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(acc.availableBalance))}
                                    </div>
                                </div>
                                <BalanceAdjuster accountId={acc.id} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. FULL PROFILE & KYC DATA (UPDATED) */}
                <div className={styles.section}>
                    <h3 className={styles.secTitle}><User size={18} /> Client Profile</h3>

                    {/* A. Personal */}
                    <h4 className={styles.subHeader}>Personal Information</h4>
                    <div className={styles.profileGrid}>
                        <div className={styles.field}><label>Email</label><input disabled defaultValue={user.email} className={styles.input} /></div>
                        <div className={styles.field}><label>Phone</label><input disabled defaultValue={user.phone || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>Date of Birth</label><input disabled defaultValue={formatDate(user.dateOfBirth)} className={styles.input} /></div>
                        <div className={styles.field}><label>Gender</label><input disabled defaultValue={user.gender || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>Occupation</label><input disabled defaultValue={user.occupation || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>Transaction PIN</label><input disabled defaultValue={user.transactionPin} className={styles.input} /></div>
                    </div>

                    {/* B. Address */}
                    <h4 className={styles.subHeader} style={{ marginTop: '1.5rem' }}><MapPin size={14} /> Address</h4>
                    <div className={styles.profileGrid}>
                        <div className={styles.field} style={{ gridColumn: '1 / -1' }}><label>Street Address</label><input disabled defaultValue={user.address || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>City</label><input disabled defaultValue={user.city || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>Country</label><input disabled defaultValue={user.country || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>Zip Code</label><input disabled defaultValue={user.zipCode || 'N/A'} className={styles.input} /></div>
                    </div>

                    {/* C. Next of Kin */}
                    <h4 className={styles.subHeader} style={{ marginTop: '1.5rem' }}><HeartHandshake size={14} /> Next of Kin</h4>
                    <div className={styles.profileGrid}>
                        <div className={styles.field}><label>Full Name</label><input disabled defaultValue={user.nokName || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>Relationship</label><input disabled defaultValue={user.nokRelationship || 'N/A'} className={styles.input} /></div>
                        <div className={styles.field}><label>Phone Number</label><input disabled defaultValue={user.nokPhone || 'N/A'} className={styles.input} /></div>
                    </div>
                </div>

                {/* 3. VIRTUAL CARDS */}
                <div className={styles.section}>
                    <div className={styles.secHeaderRow}>
                        <h3 className={styles.secTitle}><CreditCard size={18} /> Virtual Cards</h3>
                        <IssueCardButton userId={user.id} />
                    </div>

                    <div className={styles.listContainer}>
                        {user.cards.length === 0 ? <div className={styles.empty}>No cards issued.</div> : user.cards.map(card => (
                            <div key={card.id} className={styles.listItem}>
                                <span>Visa ending in <strong>{card.cardNumber.slice(-4)}</strong></span>
                                <span className={card.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeRed}>{card.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. WIRE TRANSFERS */}
                <div className={styles.section}>
                    <h3 className={styles.secTitle}><Activity size={18} /> Wire Transfers</h3>
                    <WireManager wires={user.wireTransfers} />
                </div>

            </div>
        </div>
    );
}