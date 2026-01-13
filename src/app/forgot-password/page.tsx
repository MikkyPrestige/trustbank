import Link from "next/link";
import { ShieldAlert, ArrowLeft, Phone } from "lucide-react";
import styles from "../../components/auth/auth.module.css";

export default function ForgotPasswordPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            padding: '1rem'
        }}>
            <div className={styles.container} style={{ textAlign: 'center' }}>

                {/* Icon */}
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem auto',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
                }}>
                    <ShieldAlert size={40} />
                </div>

                <div className={styles.header}>
                    <h1>Account Locked</h1>
                    <p>Automated resets are disabled for security.</p>
                </div>

                {/* Info Card */}
                <div className={styles.section} style={{ padding: '2rem', background: '#0a0a0a' }}>
                    <p style={{ color: '#888', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                        To recover access to your vault, you must undergo a manual identity verification with our security team.
                    </p>

                    <div style={{
                        borderTop: '1px solid #222',
                        borderBottom: '1px solid #222',
                        padding: '1rem 0',
                        margin: '1rem 0'
                    }}>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>Contact Support</p>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', letterSpacing: '1px' }}>support@trustbank.com</h3>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#555' }}>
                        <Phone size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                        +1 (800) 123-4567
                    </p>
                </div>

                {/* Back Button */}
                <Link href="/login" className={styles.submitBtn} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    textDecoration: 'none',
                    marginTop: '2rem',
                    background: '#222',
                    color: '#fff'
                }}>
                    <ArrowLeft size={18} /> Return to Login
                </Link>
            </div>
        </div>
    );
}