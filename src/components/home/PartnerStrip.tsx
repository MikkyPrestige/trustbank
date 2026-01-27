import Image from "next/image";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function PartnerStrip() {
    const settings = await getSiteSettings();

    //  Construct Array dynamically
    const PARTNERS = [
        { src: settings.partner_img_1 || "/partner-1.png" },
        { src: settings.partner_img_2 || "/partner-2.png" },
        { src: settings.partner_img_3 || "/partner-3.png" },
        { src: settings.partner_img_4 || "/partner-4.png" },
        { src: settings.partner_img_5 || "/partner-5.png" },
        { src: settings.partner_img_6 || "/partner-6.png" },
    ];

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
                                <div className={styles.imgWrapper}>
                                    <Image
                                        src={p.src}
                                        alt="Partner Logo"
                                        fill
                                        className={styles.logoImage}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* 2. Duplicate Set (For seamless loop) */}
                        {PARTNERS.map((p, i) => (
                            <div key={`p2-${i}`} className={styles.logoItem} aria-hidden="true">
                                <div className={styles.imgWrapper}>
                                    <Image
                                        src={p.src}
                                        alt="Partner Logo"
                                        fill
                                        className={styles.logoImage}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* 3. Triplicate Set (For wide screens) */}
                        {PARTNERS.map((p, i) => (
                            <div key={`p3-${i}`} className={styles.logoItem} aria-hidden="true">
                                <div className={styles.imgWrapper}>
                                    <Image
                                        src={p.src}
                                        alt="Partner Logo"
                                        fill
                                        className={styles.logoImage}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>
        </section>
    );
}