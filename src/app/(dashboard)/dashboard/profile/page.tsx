import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import styles from "./profile.module.css";
import {
    ShieldCheck, AlertTriangle, Building2, MapPin,
    Mail, Phone, Calendar, Hash, Globe, CreditCard,
    Briefcase, User, HeartHandshake, Home
} from "lucide-react";
import Image from "next/image";
import { KycStatus, AccountStatus, AccountType } from "@prisma/client";

export default async function ProfilePage() {
    const session = await auth();
    if (!session) redirect("/login");

    const user = await db.user.findUnique({
        where: { id: session.user.id },
        include: { accounts: true }
    });

    if (!user) return null;

    // 1. USE ENUMS FOR STATUS CHECKS
    const isVerified = user.kycStatus === KycStatus.VERIFIED;

    // 2. FILTER ACCOUNTS USING ENUMS
    const savingsAcc = user.accounts.find(a => a.type === AccountType.SAVINGS);
    const checkingAcc = user.accounts.find(a => a.type === AccountType.CHECKING);

    // Format Date
    const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
    });

    // Helper: Handle Null Values Standardized
    const val = (v: string | null | undefined) => v || "N/A";

    // Helper: Status Color Logic based on AccountStatus Enum
    const getStatusColor = (status: AccountStatus) => {
        return status === AccountStatus.ACTIVE ? 'var(--success)' : 'var(--danger)';
    };

    return (
        <div className={styles.container}>
            {/* --- HEADER --- */}
            <div className={styles.headerCard}>
                <div className={styles.profileHeader}>
                    <div className={styles.avatarLarge}>
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt={user.fullName}
                                width={100}
                                height={100}
                                className={styles.avatarImg}
                            />
                        ) : (
                            <span className={styles.initials}>
                                {user.fullName.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div className={styles.verificationBadge}>
                            {isVerified ? (
                                <ShieldCheck size={24} className={styles.iconVerified} />
                            ) : (
                                <AlertTriangle size={24} className={styles.iconUnverified} />
                            )}
                        </div>
                    </div>

                    <div className={styles.headerInfo}>
                        <h1 className={styles.name}>{user.fullName}</h1>
                        <p className={styles.status}>
                            {isVerified ? "Verified Identity" : "Unverified Account"}
                        </p>
                        <p className={styles.joined}>Member since {joinedDate}</p>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {/* --- LEFT COL: BANKING IDENTITY --- */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <Building2 className={styles.cardIcon} />
                        <h3>Banking Identity</h3>
                    </div>

                    <div className={styles.detailList}>
                        <div className={styles.subHeader}>Bank Details</div>
                        <div className={styles.detailRow}>
                            <div className={styles.label}><Building2 size={14} /> Bank Name</div>
                            <div className={styles.value}>TrustBank Intl.</div>
                        </div>
                        <div className={styles.detailRow}>
                            <div className={styles.label}><Globe size={14} /> Routing (ABA)</div>
                            <div className={styles.valueMono}>
                                {savingsAcc?.routingNumber || checkingAcc?.routingNumber || "091000022"}
                            </div>
                        </div>

                        <div className={styles.divider}></div>

                        {/* SAVINGS ACCOUNT */}
                        {savingsAcc && (
                            <>
                                <div className={styles.subHeader}>Savings Account</div>
                                <div className={styles.detailRow}>
                                    <div className={styles.label}><Hash size={14} /> Account Number</div>
                                    <div className={styles.valueMono}>{savingsAcc.accountNumber}</div>
                                </div>
                                <div className={styles.detailRow}>
                                    <div className={styles.label}><CreditCard size={14} /> Status</div>
                                    <div className={styles.value} style={{ color: getStatusColor(savingsAcc.status) }}>
                                        {savingsAcc.status}
                                    </div>
                                </div>
                                <div className={styles.detailRow}>
                                    <div className={styles.label}><Globe size={14} /> Currency</div>
                                    <div className={styles.value}>{savingsAcc.currency}</div>
                                </div>
                                <div className={styles.divider}></div>
                            </>
                        )}

                        {/* CHECKING ACCOUNT */}
                        {checkingAcc && (
                            <>
                                <div className={styles.subHeader}>Checking Account</div>
                                <div className={styles.detailRow}>
                                    <div className={styles.label}><Hash size={14} /> Account Number</div>
                                    <div className={styles.valueMono}>{checkingAcc.accountNumber}</div>
                                </div>
                                <div className={styles.detailRow}>
                                    <div className={styles.label}><CreditCard size={14} /> Status</div>
                                    <div className={styles.value} style={{ color: getStatusColor(checkingAcc.status) }}>
                                        {checkingAcc.status}
                                    </div>
                                </div>
                                <div className={styles.detailRow}>
                                    <div className={styles.label}><Globe size={14} /> Currency</div>
                                    <div className={styles.value}>{checkingAcc.currency}</div>
                                </div>
                            </>
                        )}

                        {!savingsAcc && !checkingAcc && (
                            <p className={styles.emptyText}>No active accounts found.</p>
                        )}
                    </div>
                </div>

                {/* --- RIGHT COL: PERSONAL & NOK --- */}
                <div className={styles.column}>

                    {/* PERSONAL DETAILS */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <User className={styles.cardIcon} />
                            <h3>Personal Details</h3>
                        </div>

                        <div className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Mail size={14} /> Email</div>
                                <div className={styles.value}>{user.email}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Phone size={14} /> Phone</div>
                                <div className={styles.value}>{val(user.phone)}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Briefcase size={14} /> Occupation</div>
                                <div className={styles.value}>{val(user.occupation)}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><User size={14} /> Gender</div>
                                <div className={styles.value} style={{ textTransform: 'capitalize' }}>
                                    {val(user.gender).toLowerCase()}
                                </div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Calendar size={14} /> Date of Birth</div>
                                <div className={styles.value}>
                                    {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RESIDENTIAL ADDRESS */}
                    <div className={styles.card} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <MapPin className={styles.cardIcon} />
                            <h3>Residential Address</h3>
                        </div>
                        <div className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Home size={14} /> Street Address</div>
                                <div className={styles.value}>{val(user.address)}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><MapPin size={14} /> City / State</div>
                                <div className={styles.value}>{val(user.city)}, {val(user.state)}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Globe size={14} /> Country / Zip</div>
                                <div className={styles.value}>{val(user.country)} - {val(user.zipCode)}</div>
                            </div>
                        </div>
                    </div>

                    {/* NEXT OF KIN */}
                    <div className={styles.card} style={{ marginTop: '1.5rem' }}>
                        <div className={styles.cardHeader}>
                            <HeartHandshake className={styles.cardIcon} />
                            <h3>Next of Kin</h3>
                        </div>
                        <div className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><User size={14} /> Full Name</div>
                                <div className={styles.value}>{val(user.nokName)}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><HeartHandshake size={14} /> Relationship</div>
                                <div className={styles.value}>{val(user.nokRelationship)}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Phone size={14} /> Contact Phone</div>
                                <div className={styles.value}>{val(user.nokPhone)}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><MapPin size={14} /> Address</div>
                                <div className={styles.value}>{val(user.nokAddress)}</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}