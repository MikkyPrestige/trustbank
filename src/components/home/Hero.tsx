import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";

interface HeroProps {
    badgeText?: string;
    title?: string;
    subtitle?: string;
    ctaText?: string;
    imgSrc?: string;
    imgAlt?: string;
}

export default function Hero({ badgeText, title, subtitle, ctaText, imgSrc, imgAlt }: HeroProps) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroBg}>
                <Image
                    src={imgSrc || "/hero-human.png"}
                    alt={imgAlt || "Banking Lifestyle"}
                    fill
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                    priority
                />
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.container}>
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>
                        {badgeText || "TRUST BANK PERSONAL"}
                    </span>

                    <h1 className={styles.heroTitle}>
                        {title ? (
                            <span dangerouslySetInnerHTML={{ __html: title.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <>
                                FINANCIAL FREEDOM <br /> STARTS HERE.
                            </>
                        )}
                    </h1>

                    <p className={styles.heroSub}>
                        {subtitle || (
                            <>
                                Experience the perfect blend of human support and modern technology.
                                Open a checking account today and get a <strong>$200 bonus</strong>.
                            </>
                        )}
                    </p>

                    <div className={styles.ctaRow}>
                        <Link href="/register" className={styles.btnPrimary}>
                            {ctaText || "OPEN ACCOUNT"}
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