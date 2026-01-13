import RegisterForm from "@/components/auth/RegisterForm";
import styles from "./register.module.css";

export default function RegisterPage() {
    return (
        <div className={styles.pageWrapper}>
            <RegisterForm />
        </div>
    );
}