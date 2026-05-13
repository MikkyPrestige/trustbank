import { Suspense } from 'react';
import { Loader2 } from "lucide-react";
import ResendVerificationForm from '@/components/auth/resendVerification/ResendVerificationForm';
import styles from "../../../components/auth/login/styles/loading.module.css";

export const metadata = {
    title: 'Resend Verification | Trust Bank',
};

export default function ResendVerificationPage() {
    return (
         <Suspense fallback={
                    <div className={styles.loaderContainer}>
                        <div className={styles.loaderInner}>
                            <Loader2 size={48} className={styles.spinner} />
                            <p className={styles.loaderText}>Loading secure vault…</p>
                        </div>
                    </div>
                }>
            <ResendVerificationForm />
                </Suspense>
    );
}