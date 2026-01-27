import { getSiteSettings } from "@/lib/content/get-settings";
import { Phone, Mail, MapPin, MessageSquare } from "lucide-react";
import styles from "./contact.module.css";
import Image from "next/image";

export default async function ContactPage() {
    const settings = await getSiteSettings();

    return (
        <main className={styles.main}>
            {/* HERO SECTION */}
            <section className={styles.hero}>
                <div className={styles.heroImageWrapper}>
                    <Image
                        src={settings.support_hero_img || "/support-hero.png"}
                        alt={settings.support_hero_alt || "Contact Support"}
                        fill
                        className={styles.heroImage}
                        priority
                    />
                    <div className={styles.heroOverlay} />
                </div>

                <div className={styles.heroContent}>
                    <h1>{settings.support_hero_title}</h1>
                    <p>{settings.support_hero_desc}</p>
                </div>
            </section>

            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Card 1: Call */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Phone size={24} /></div>
                        <h3>{settings.support_phone_title}</h3>
                        <p className={styles.value}>{settings.support_phone}</p>
                        <p className={styles.sub}>{settings.support_hours}</p>
                    </div>

                    {/* Card 2: Email */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><Mail size={24} /></div>
                        <h3>{settings.support_email_title}</h3>
                        <p className={styles.value}>{settings.support_email}</p>
                        <p className={styles.sub}>{settings.support_email_desc}</p>
                    </div>

                    {/* Card 3: Visit */}
                    <div className={styles.card}>
                        <div className={styles.iconBox}><MapPin size={24} /></div>
                        <h3>{settings.support_address_title}</h3>
                        <p className={styles.value}>{settings.support_address_label}</p>
                        <p className={styles.sub}>{settings.support_address}</p>
                    </div>
                </div>

                {/* FAQ Teaser */}
                <div className={styles.faqTeaser}>
                    <MessageSquare size={48} className={styles.faqIcon} />
                    <div>
                        <h2>{settings.support_faq_title}</h2>
                        <p>{settings.support_faq_desc}</p>
                        <a href={settings.support_faq_link || "/help"} className={styles.link}>
                            {settings.support_faq_linkText} &rarr;
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}