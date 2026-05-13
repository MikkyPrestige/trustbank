import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import VerifyEmailForm from "@/components/auth/verifyEmail/VerifyEmailForm";
import styles from "../../../components/auth/login/styles/loading.module.css";

export const metadata = {
    title: "Verify Account | Trust Capital",
};

export default function VerifyPage() {
      return (
        <Suspense fallback={
          <div className={styles.loaderContainer}>
            <div className={styles.loaderInner}>
              <Loader2 size={48} className={styles.spinner} />
              <p className={styles.loaderText}>Loading secure vault…</p>
            </div>
          </div>
        }>
          <VerifyEmailForm />
        </Suspense>
        );
}