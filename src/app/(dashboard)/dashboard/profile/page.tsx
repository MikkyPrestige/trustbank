import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/content/get-settings";
import { redirect } from "next/navigation";
import styles from "./profile.module.css";
import {
    ShieldCheck, AlertTriangle, Building2, MapPin,
    Mail, Phone, Calendar, Hash, Globe, CreditCard,
    Briefcase, User, HeartHandshake, Home,
    TrendingUp, Ban, Zap
} from "lucide-react";
import Image from "next/image";
import { KycStatus, AccountStatus, AccountType } from "@prisma/client";

export default async function ProfilePage() {
    const session = await auth();
    if (!session) redirect("/login");

    const [user, settings] = await Promise.all([
        db.user.findUnique({
            where: { id: session.user.id },
            include: { accounts: true }
        }),
        getSiteSettings()
    ]);

    if (!user) return null;


    const displayCurrency = user.currency || "USD";
    const isVerified = user.kycStatus === KycStatus.VERIFIED;

    const savingsAcc = user.accounts.find(a => a.type === AccountType.SAVINGS);
    const checkingAcc = user.accounts.find(a => a.type === AccountType.CHECKING);

    const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
    });

    const val = (v: string | null | undefined) => v || "N/A";

    const getStatusClass = (status: AccountStatus) => {
        return status === AccountStatus.ACTIVE ? styles.textSuccess : styles.textDanger;
    };

    // --- LOGIC: DYNAMIC LIMITS BASED ON KYC ---
    const limits = isVerified ? {
        transfer: "Unlimited",
        wire: "Unlimited",
        crypto: "Unlimited"
    } : {
        transfer: "$10,000.00",
        wire: "Disabled",
        crypto: "Disabled"
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
                {/* --- LEFT COLUMN --- */}
                <div className={styles.column}>

                    {/* 1. BANKING IDENTITY */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <Building2 className={styles.cardIcon} />
                            <h3>Banking Identity</h3>
                        </div>

                        <div className={styles.detailList}>
                            <div className={styles.subHeader}>Bank Details</div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Building2 size={14} /> Bank Name</div>
                                <div className={styles.value}>{settings.site_name}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Globe size={14} /> Routing (ABA)</div>
                                <div className={styles.valueMono}>
                                    {settings.routingNumber || "091000022"}
                                </div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Globe size={14} /> SWIFT / BIC</div>
                                <div className={styles.valueMono}>{settings.swiftCode || "TRUSUS33"}</div>
                            </div>

                            <div className={styles.divider}></div>

                            {/* SAVINGS */}
                            {savingsAcc && (
                                <>
                                    <div className={styles.subHeader}>Savings Account</div>
                                    <div className={styles.detailRow}>
                                        <div className={styles.label}><Hash size={14} /> Account Number</div>
                                        <div className={styles.valueMono}>{savingsAcc.accountNumber}</div>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <div className={styles.label}><CreditCard size={14} /> Status</div>
                                        <div className={`${styles.value} ${getStatusClass(savingsAcc.status)}`}>
                                            {savingsAcc.status}
                                        </div>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <div className={styles.label}><Globe size={14} /> Currency</div>
                                        <div className={`${styles.value} ${styles.valueHighlight}`}>{displayCurrency}</div>
                                    </div>
                                    <div className={styles.divider}></div>
                                </>
                            )}

                            {/* CHECKING */}
                            {checkingAcc && (
                                <>
                                    <div className={styles.subHeader}>Checking Account</div>
                                    <div className={styles.detailRow}>
                                        <div className={styles.label}><Hash size={14} /> Account Number</div>
                                        <div className={styles.valueMono}>{checkingAcc.accountNumber}</div>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <div className={styles.label}><CreditCard size={14} /> Status</div>
                                        <div className={`${styles.value} ${getStatusClass(checkingAcc.status)}`}>
                                            {checkingAcc.status}
                                        </div>
                                    </div>
                                    <div className={styles.detailRow}>
                                        <div className={styles.label}><Globe size={14} /> Currency</div>
                                        <div className={`${styles.value} ${styles.valueHighlight}`}>{displayCurrency}</div>
                                    </div>
                                </>
                            )}
                            {!savingsAcc && !checkingAcc && (
                                <p className={styles.emptyText}>No active accounts found.</p>
                            )}
                        </div>
                    </div>

                    {/* 2. ACCOUNT LIMITS  */}
                    <div className={`${styles.card} ${styles.cardSpacing}`}>
                        <div className={styles.cardHeader}>
                            <TrendingUp className={styles.cardIcon} />
                            <h3>Account Limits</h3>
                        </div>
                        <div className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Zap size={14} /> Daily Transfer Limit</div>
                                <div className={styles.valueMono}>{limits.transfer}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Globe size={14} /> Wire Transfer Limit</div>
                                <div className={styles.valueMono}>{limits.wire}</div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Ban size={14} /> Crypto Withdrawals</div>
                                <div className={styles.valueMono}>{limits.crypto}</div>
                            </div>
                            {!isVerified && (
                                <div className={styles.limitWarning}>
                                    <AlertTriangle size={14} />
                                    Verify your identity to increase limits.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className={styles.column}>

                    {/* 3. PERSONAL DETAILS */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <User className={styles.cardIcon} />
                            <h3>Personal Details</h3>
                        </div>
                        <div className={styles.detailList}>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><Globe size={14} /> Display Currency</div>
                                <div className={`${styles.value} ${styles.valueHighlight}`}>
                                    {displayCurrency}
                                </div>
                            </div>
                            <div className={styles.detailRow}>
                                <div className={styles.label}><ShieldCheck size={14} /> Transaction PIN</div>
                                <div className={styles.value}>
                                    {user.transactionPin ? (
                                        <span className={`${styles.pinStatus} ${styles.textSuccess}`}>
                                            Active <ShieldCheck size={12} />
                                        </span>
                                    ) : (
                                        <span className={`${styles.pinStatus} ${styles.textDanger}`}>
                                            Not Set <AlertTriangle size={12} />
                                        </span>
                                    )}
                                </div>
                            </div>
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
                                <div className={`${styles.value} ${styles.valueCapitalized}`}>
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

                    {/* 4. RESIDENTIAL ADDRESS */}
                    <div className={`${styles.card} ${styles.cardSpacing}`}>
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

                    {/* 5. NEXT OF KIN */}
                    <div className={`${styles.card} ${styles.cardSpacing}`}>
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