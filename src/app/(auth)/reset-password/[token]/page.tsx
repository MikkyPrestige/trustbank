import ResetPasswordForm from "@/components/auth/resetPassword/ResetPasswordForm";

export const metadata = {
    title: "Reset Password | TrustBank",
};

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    return <ResetPasswordForm token={token} />;
}