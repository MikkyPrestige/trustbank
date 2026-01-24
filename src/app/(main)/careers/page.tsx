import { getJobs } from "@/lib/get-jobs";
import { getSiteSettings } from "@/lib/get-settings";
import { Users, Zap, Heart, ArrowRight, MapPin } from "lucide-react";
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
                <div className={styles.heroContent}>
                    <h1>Build the Future of Banking</h1>
                    <p>Join a team that values innovation, integrity, and putting people first. We are redefining what it means to be a bank.</p>
                    <button className={styles.primaryBtn}>View Open Roles</button>
                </div>
            </section>

            {/* 2. VALUES */}
            <section className={styles.valuesSection}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2>Why {settings.site_name}?</h2>
                        <p>More than just a paycheck. A place to grow.</p>
                    </div>

                    <div className={styles.valuesGrid}>
                        <div className={styles.valueCard}>
                            <div className={styles.iconBox}><Zap size={24} /></div>
                            <h3>Innovation First</h3>
                            <p>We leverage modern tech to solve old problems. No legacy systems holding you back.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.iconBox}><Users size={24} /></div>
                            <h3>Inclusive Culture</h3>
                            <p>We believe diverse teams build better products. Bring your authentic self to work.</p>
                        </div>
                        <div className={styles.valueCard}>
                            <div className={styles.iconBox}><Heart size={24} /></div>
                            <h3>Comprehensive Benefits</h3>
                            <p>From 401k matching to premium health covers, we take care of you and your family.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. JOB BOARD */}
            <section className={styles.jobsSection}>
                <div className={styles.container}>
                    <h2 className={styles.jobsTitle}>Open Positions</h2>

                    <div className={styles.jobList}>
                        {jobs.length === 0 ? (
                            <div className={styles.noRoles} style={{ textAlign: 'center', padding: '2rem' }}>
                                <p>No open positions at the moment. Please check back later.</p>
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
                            Don&apos;t see the right fit?{' '}
                            <a href={`mailto:careers@${settings.site_name.toLowerCase().replace(/\s/g, '')}.com`}>
                                Email us your resume
                            </a>.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    );
}