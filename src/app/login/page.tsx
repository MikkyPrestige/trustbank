import LoginForm from "@/components/auth/LoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
    return (
        <div className={styles.pageWrapper}>
            <LoginForm />
        </div>
    );
}