import Image from "next/image";
import styles from "../../app/home.module.css";

// Define logos here for easy management
const PARTNERS = [
    { name: "Visa", src: "/partner-1.png", width: 90, height: 30 },
    { name: "Mastercard", src: "/partner-2.png", width: 70, height: 40 },
    { name: "Stripe", src: "/partner-3.png", width: 80, height: 35 },
    { name: "PayPal", src: "/partner-4.png", width: 90, height: 25 },
    { name: "American Express", src: "/partner-5.png", width: 80, height: 50 },
    { name: "AWS", src: "/partner-6.png", width: 60, height: 40 },
];

export default function PartnerStrip() {
    return (
        <section className={styles.partnerSection}>
            <div className={styles.partnerContainer}>
                <p className={styles.partnerLabel}>Trusted by industry leaders</p>

                {/* THE MASK CONTAINER (Creates the fade edges) */}
                <div className={styles.marqueeMask}>
                    <div className={styles.marqueeTrack}>

                        {/* 1. Original Set */}
                        {PARTNERS.map((p, i) => (
                            <div key={`p1-${i}`} className={styles.logoItem}>
                                <Image
                                    src={p.src}
                                    alt={p.name}
                                    width={p.width}
                                    height={p.height}
                                    className={styles.logoImage}
                                />
                            </div>
                        ))}

                        {/* 2. Duplicate Set (For seamless loop) */}
                        {PARTNERS.map((p, i) => (
                            <div key={`p2-${i}`} className={styles.logoItem} aria-hidden="true">
                                <Image
                                    src={p.src}
                                    alt={p.name}
                                    width={p.width}
                                    height={p.height}
                                    className={styles.logoImage}
                                />
                            </div>
                        ))}

                        {/* 3. Triplicate Set (To ensure wide screens are full) */}
                        {PARTNERS.map((p, i) => (
                            <div key={`p3-${i}`} className={styles.logoItem} aria-hidden="true">
                                <Image
                                    src={p.src}
                                    alt={p.name}
                                    width={p.width}
                                    height={p.height}
                                    className={styles.logoImage}
                                />
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </section>
    );
}