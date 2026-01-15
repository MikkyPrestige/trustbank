import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.heroBg}>
                <Image
                    src="/hero-human.png"
                    alt="Banking Lifestyle"
                    fill
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                    priority
                />
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.container}>
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>TRUSTBANK PERSONAL</span>
                    <h1 className={styles.heroTitle}>
                        FINANCIAL FREEDOM <br />
                        STARTS HERE.
                    </h1>
                    <p className={styles.heroSub}>
                        Experience the perfect blend of human support and modern technology.
                        Open a checking account today and get a <strong>$200 bonus</strong>.
                    </p>
                    <div className={styles.ctaRow}>
                        <Link href="/register" className={styles.btnPrimary}>
                            OPEN ACCOUNT
                        </Link>
                        <Link href="/rates" className={styles.btnOutline}>
                            SEE CURRENT RATES
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}