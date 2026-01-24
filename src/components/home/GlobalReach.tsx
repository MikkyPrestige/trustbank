import Link from "next/link";
import Image from "next/image";
import { Globe, ShieldCheck, Wifi } from "lucide-react";
import styles from "./home.module.css";
import { getSiteSettings } from "@/lib/get-settings";

const HOTSPOTS = [
    { city: "New York", top: "34%", left: "28%" },
    { city: "London", top: "26%", left: "48%" },
    { city: "Lagos", top: "52%", left: "51%" },
    { city: "Dubai", top: "42%", left: "62%" },
    { city: "Tokyo", top: "36%", left: "86%" },
    { city: "Singapore", top: "55%", left: "78%" },
    { city: "Sydney", top: "78%", left: "90%" },
    { city: "Sao Paulo", top: "70%", left: "32%" },
];

export default async function GlobalReach() {
    // 1. Fetch Dynamic Data
    const settings = await getSiteSettings();

    return (
        <section className={styles.globalSection}>
            <div className={styles.container}>

                {/* HEADLINE */}
                <div className={styles.globalHeader}>
                    <h2 className={styles.sectionTitleDark}>
                        {settings.home_global_title} <span className={styles.highlightBlue}>{settings.home_global_highlight}</span>
                    </h2>
                    <p className={styles.sectionDescDark}>
                        {settings.home_global_desc}
                    </p>
                </div>

                {/* THE MAP VISUAL */}
                <div className={styles.mapWrapper}>
                    <Image
                        src="/world-map-dark.png"
                        alt="Global Network"
                        fill
                        className={styles.mapImage}
                        quality={100}
                    />

                    {/* Pulsing Hotspots (Visual only, no CMS needed for coordinates) */}
                    {HOTSPOTS.map((spot) => (
                        <div
                            key={spot.city}
                            className={styles.hotspot}
                            style={{ top: spot.top, left: spot.left }}
                        >
                            <div className={styles.hotspotPulse}></div>
                            <div className={styles.hotspotDot}></div>

                            <div className={styles.hotspotTooltip}>
                                <span className={styles.tooltipCity}>{spot.city}</span>
                                <span className={styles.tooltipStatus}>Operational</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* STATS STRIP */}
                <div className={styles.statsStrip}>
                    <div className={styles.statItem}>
                        <Globe size={24} className={styles.statIcon} />
                        <div>
                            <strong>{settings.global_stat_countries} Countries</strong>
                            <span>Accepted worldwide</span>
                        </div>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <Wifi size={24} className={styles.statIcon} />
                        <div>
                            <strong>{settings.global_stat_digital} Digital</strong>
                            <span>Manage from anywhere</span>
                        </div>
                    </div>
                    <div className={styles.statDivider}></div>
                    <div className={styles.statItem}>
                        <ShieldCheck size={24} className={styles.statIcon} />
                        <div>
                            <strong>Global Fraud Shield</strong>
                            <span>{settings.global_stat_fraud} Monitoring</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}