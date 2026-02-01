'use client';

import { useActionState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Mail, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import styles from "./forgotPassword.module.css";
import { requestPasswordReset } from "@/actions/user/request-reset";

const initialState = {
    message: '',
    success: false
};

export default function ForgotPasswordCard() {
    const [state, action, isPending] = useActionState(requestPasswordReset, initialState);

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.ambientMesh}></div>

            <div className={styles.formContainer}>
                <div className={styles.glassForm}>

                    {/* --- STATE 1: SUCCESS --- */}
                    {state.success ? (
                        <div className={styles.successWrapper}>
                            <div className={styles.successIconWrapper}>
                                <CheckCircle size={32} />
                            </div>
                            <h1 className={styles.successTitle}>Check Your Email</h1>
                            <p className={styles.successText}>
                                We sent a password reset link to your email address. It will expire in 1 hour.
                            </p>
                            <Link href="/login" className={styles.secondaryBtn}>
                                <ArrowLeft size={18} /> Back to Login
                            </Link>
                        </div>
                    ) : (
                        /* --- STATE 2: INPUT FORM --- */
                        <form action={action}>
                            <div className={styles.header}>
                                <div className={styles.headerBadge}>
                                    <ShieldAlert size={14} />
                                    <span>Secure Recovery</span>
                                </div>
                                <h1>Forgot Password?</h1>
                                <p>Enter your email address to reset your access credentials.</p>
                            </div>

                            {/* Error Message */}
                            {state.message && !state.success && (
                                <div className={styles.errorBanner}>
                                    <ShieldAlert size={16} /> {state.message}
                                </div>
                            )}

                            <div className={styles.fieldGroup}>
                                <div className={styles.inputContainer}>
                                    <label className={styles.inputLabel}>Email Address</label>
                                    <div className={styles.inputIcon}>
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required
                                        className={styles.inputField}
                                    />
                                </div>
                            </div>

                            <button
                                disabled={isPending}
                                className={styles.submitBtn}
                            >
                                {isPending ? (
                                    <><Loader2 className={styles.spin} size={18} /> Sending...</>
                                ) : (
                                    <>Send Reset Link <ArrowRight size={18} /></>
                                )}
                            </button>

                            <div className={styles.footerLinkWrapper}>
                                <Link href="/login" className={styles.footerLink}>
                                    <ArrowLeft size={16} /> Back to Login
                                </Link>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
}


// 'use client';

// import Link from "next/link";
// import { ShieldAlert, ArrowLeft, Phone } from "lucide-react";
// import styles from "./forgotPassword.module.css";
// import { DEFAULT_SETTINGS } from "@/lib/content/get-settings";

// interface Props {
//     siteName?: string;
//     contactEmail?: string;
//     contactPhone?: string;
// }

// export default function ForgotPasswordCard({
//     siteName = DEFAULT_SETTINGS.site_name,
//     contactEmail = DEFAULT_SETTINGS.contact_email,
//     contactPhone = DEFAULT_SETTINGS.contact_phone
// }: Props) {
//     return (
//         <div className={styles.pageWrapper}>

//             <div className={styles.ambientMesh}></div>

//             <div className={styles.formContainer}>

//                 <div className={styles.glassForm}>

//                     <div className={styles.dangerIconBox}>
//                         <ShieldAlert size={40} />
//                     </div>

//                     <div className={styles.header}>
//                         <h1>Account Security</h1>
//                         <p>Automated password resets are disabled.</p>
//                     </div>

//                     <div className={styles.infoCard}>
//                         <p className={styles.infoText}>
//                             To protect your assets, {siteName} Enterprise requires manual identity verification for all credential resets.
//                         </p>

//                         <div className={styles.contactRow}>
//                             <span className={styles.contactLabel}>Contact Security Team</span>
//                             <div className={styles.contactValue}>{contactEmail}</div>
//                         </div>

//                         <div className={styles.phoneText}>
//                             <Phone size={14} /> {contactPhone}
//                         </div>
//                     </div>

//                     <Link href="/login" className={styles.secondaryBtn}>
//                         <ArrowLeft size={18} /> Return to Vault Access
//                     </Link>

//                 </div>
//             </div>
//         </div>
//     );
// }