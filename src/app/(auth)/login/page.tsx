import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSiteSettings } from "@/lib/content/get-settings";
import { getBooleanSetting } from "@/lib/security";
import LoginForm from "@/components/auth/login/LoginForm";
import styles from "../../../components/auth/login/styles/loading.module.css";

export default async function LoginPage() {
    const session = await auth();
    if (session?.user) redirect("/dashboard");

    const settings = await getSiteSettings();
    const isRegisterEnabled = await getBooleanSetting('feature_register_enabled', true);

    return (
        <Suspense fallback={
            <div className={styles.loaderContainer}>
                <div className={styles.loaderInner}>
                    <Loader2 size={48} className={styles.spinner} />
                    <p className={styles.loaderText}>Loading secure vault…</p>
                </div>
            </div>
        }>
            <LoginForm siteName={settings.site_name} allowRegister={isRegisterEnabled} isLoggedIn={!!session?.user} />
        </Suspense>
    );
}