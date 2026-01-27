import { getJobs } from "@/lib/content/get-jobs";
import { getSiteSettings } from "@/lib/content/get-settings";
import { Users, Zap, Heart, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import styles from "./careers.module.css";

export default async function CareersPage() {
    const [jobs, settings] = await Promise.all([
        getJobs(),
        getSiteSettings()
    ]);

    return (
        <div className={styles.pageWrapper}>

            {/* 1. HERO */}
            <section className={styles.hero}>
                <div className={styles.heroImageWrapper}>
                    <Image
                        src={settings.careers_hero_img || "/careers-hero.png"}
                        alt={settings.careers_hero_img_alt || "Our Team"}
                        fill
                        className={styles.heroImage}
                        priority
                    />
                    <div className={styles.heroOverlay} />
                </div>

                <div className={styles.heroContent}>
                    <h1>{settings.careers_hero_title}</h1>
                    <p>{settings.careers_hero_desc}</p>

                    <a href={settings.careers_hero_btn_link || "#jobs"} className={styles.primaryBtn}>
                        {settings.careers_hero_btn_text}
                    </a>
                </div>
            </section>

            {/* 2. VALUES */}
            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Why {settings.site_name}?</h2>
                        <p>{settings.careers_values_subtitle}</p>
                    </div>

                    <div className={styles.valuesGrid}>
                        {/* Value 1 */}
                        <div className={styles.valueCard}>
                            <div className={styles.iconBox}><Zap size={24} /></div>
                            <h3>{settings.careers_val1_title}</h3>
                            <p>{settings.careers_val1_desc}</p>
                        </div>

                        {/* Value 2 */}
                        <div className={styles.valueCard}>
                            <div className={styles.iconBox}><Users size={24} /></div>
                            <h3>{settings.careers_val2_title}</h3>
                            <p>{settings.careers_val2_desc}</p>
                        </div>

                        {/* Value 3 */}
                        <div className={styles.valueCard}>
                            <div className={styles.iconBox}><Heart size={24} /></div>
                            <h3>{settings.careers_val3_title}</h3>
                            <p>{settings.careers_val3_desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. JOB BOARD */}
            <section id="jobs" className={styles.jobsSection}>
                <div className={styles.container}>
                    <h2 className={styles.jobsTitle}>{settings.careers_jobs_title}</h2>

                    <div className={styles.jobList}>
                        {jobs.length === 0 ? (
                            <div className={styles.noRoles} style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>{settings.careers_jobs_no_roles}</p>
                            </div>
                        ) : (
                            jobs.map((job) => (
                                <div key={job.id} className={styles.jobRow}>
                                    <div className={styles.jobInfo}>
                                        <h3>{job.title}</h3>
                                        <div className={styles.jobMeta}>
                                            <span className={styles.dept}>{job.department}</span>
                                            <span className={styles.dot}>•</span>
                                            <span className={styles.loc}><MapPin size={14} /> {job.location}</span>
                                            <span className={styles.dot}>•</span>
                                            <span className={styles.type}>{job.type}</span>
                                        </div>
                                    </div>
                                    <button className={styles.applyBtn}>
                                        Apply Now <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.noRoles}>
                        <p>
                            <a href={`mailto:careers@${settings.site_name.toLowerCase().replace(/\s/g, '')}.com`}>
                                {settings.careers_jobs_email_text}
                            </a>
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
}