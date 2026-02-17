import Link from "next/link";
import Image from "next/image";
import styles from "./home.module.css";

interface HeroProps {
    siteName: string;
    badgeText?: string;
    imgSrc: string;
    imgAlt: string;
    title?: string;
    subtitle?: string;
    ctaLink: string;
    ctaText?: string;
    cta1Text?: string;
    cta1Link: string;
}

export default function Hero({ siteName, badgeText, imgSrc, imgAlt, title, subtitle, ctaLink, ctaText, cta1Text, cta1Link }: HeroProps) {
    return (
        <section className={styles.hero}>
            <div className={styles.heroBg}>
                <Image
                    src={imgSrc}
                    alt={imgAlt}
                    fill
                    style={{ objectFit: "cover", objectPosition: "top center" }}
                    priority
                />
                <div className={styles.overlay}></div>
            </div>

            <div className={styles.container}>
                <div className={styles.heroContent}>
                    <span className={styles.heroBadge}>
                        {siteName} {badgeText}
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
                        <Link href={ctaLink} className={styles.btnPrimary}>
                            {ctaText}
                        </Link>
                        <Link href={cta1Link} className={styles.btnOutline}>
                            {cta1Text}
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}