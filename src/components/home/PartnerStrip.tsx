import Image from "next/image";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/content/get-settings";

export default async function PartnerStrip() {
    const settings = await getSiteSettings();

    const PARTNERS = [
        { src: settings.partner_img_1, alt: settings.partner_img_1_alt },
        { src: settings.partner_img_2, alt: settings.partner_img_2_alt },
        { src: settings.partner_img_3, alt: settings.partner_img_3_alt },
        { src: settings.partner_img_4, alt: settings.partner_img_4_alt },
        { src: settings.partner_img_5, alt: settings.partner_img_5_alt },
        { src: settings.partner_img_6, alt: settings.partner_img_6_alt },
    ];

    return (
        <section className={styles.partnerSection}>
            <div className={styles.partnerContainer}>
                <p className={styles.partnerLabel}>{settings.home_partner_label}</p>
                <div className={styles.marqueeMask}>
                    <div className={styles.marqueeTrack}>
                        {PARTNERS.map((p, i) => (
                            <div key={`p1-${i}`} className={styles.logoItem}>
                                <div className={styles.imgWrapper}>
                                    <Image
                                        src={p.src}
                                        alt={p.alt}
                                        fill
                                        className={styles.logoImage}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}

                        {PARTNERS.map((p, i) => (
                            <div key={`p2-${i}`} className={styles.logoItem} aria-hidden="true">
                                <div className={styles.imgWrapper}>
                                    <Image
                                        src={p.src}
                                        alt={p.alt}
                                        fill
                                        className={styles.logoImage}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}

                        {PARTNERS.map((p, i) => (
                            <div key={`p3-${i}`} className={styles.logoItem} aria-hidden="true">
                                <div className={styles.imgWrapper}>
                                    <Image
                                        src={p.src}
                                        alt={p.alt}
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