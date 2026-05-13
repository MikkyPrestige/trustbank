import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { getSiteSettings } from "@/lib/content/get-settings";
import RegisterForm from "@/components/auth/register/RegisterForm";
import styles from "../../../components/auth/login/styles/loading.module.css";

export default async function RegisterPage() {
    const settings = await getSiteSettings();

    return (
        <Suspense fallback={
            <div className={styles.loaderContainer}>
                <div className={styles.loaderInner}>
                    <Loader2 size={48} className={styles.spinner} />
                    <p className={styles.loaderText}>Loading secure vault…</p>
                </div>
            </div>
        }>
            <RegisterForm siteName={settings.site_name} />
        </Suspense>
    );
}