import { Suspense } from 'react';
import ResendVerificationForm from '@/components/auth/resendVerification/ResendVerificationForm';

export const metadata = {
    title: 'Resend Verification | Trust Bank',
};

export default function ResendVerificationPage() {
    return (
        <Suspense fallback={<div>Loading…</div>}>
            <ResendVerificationForm />
        </Suspense>
    );
}