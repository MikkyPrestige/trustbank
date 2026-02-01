'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Navigation, Clock, Phone, CheckCircle2 } from "lucide-react";
import BranchMap from "./BranchMap";
import styles from "./locations.module.css";

interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    hours: string | null;
    hasAtm: boolean;
    hasDriveThru: boolean;
    lat: number;
    lng: number;
}

interface Props {
    initialBranches: Branch[];
    settings: any;
}

export default function LocationsClient({ initialBranches, settings }: Props) {
    const [query, setQuery] = useState('');

    const filteredBranches = useMemo(() => {
        const lowerQuery = query.toLowerCase();
        return initialBranches.filter(branch =>
            branch.city.toLowerCase().includes(lowerQuery) ||
            branch.name.toLowerCase().includes(lowerQuery) ||
            branch.address.toLowerCase().includes(lowerQuery) ||
            branch.state.toLowerCase().includes(lowerQuery)
        );
    }, [query, initialBranches]);

    return (
        <div className={styles.pageWrapper}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.container}>
                    <h1>{settings.locations_hero_title}</h1>
                    <div className={styles.searchBar}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={settings.locations_search_placeholder}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button>{settings.locations_search_btn_text}</button>
                    </div>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.contentGrid}>

                    {/* LEFT: LIST */}
                    <div className={styles.listCol}>
                        <div className={styles.resultsCount}>
                            {filteredBranches.length} {settings.locations_results_label}
                        </div>

                        <div className={styles.list}>
                            {filteredBranches.length === 0 ? (
                                <div className={styles.noResults}>
                                    <p>{settings.locations_no_results_text} &quot;<strong>{query}</strong>&quot;</p>
                                    <button
                                        onClick={() => setQuery('')}
                                        className={styles.clearBtn}
                                    >
                                        {settings.locations_clear_btn_text}
                                    </button>
                                </div>
                            ) : (
                                filteredBranches.map((branch) => {
                                    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${branch.address}, ${branch.city}`)}`;

                                    return (
                                        <div key={branch.id} className={styles.branchCard}>
                                            <div className={styles.branchHeader}>
                                                <h3>{branch.name}</h3>
                                            </div>

                                            <div className={styles.branchDetails}>
                                                <div className={styles.detailRow}>
                                                    <MapPin size={16} className={styles.icon} />
                                                    <span>{branch.address}, {branch.city} {branch.state ? `, ${branch.state}` : ''}</span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <Phone size={16} className={styles.icon} />
                                                    <a href={`tel:${branch.phone}`} className={styles.link}>{branch.phone}</a>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <Clock size={16} className={styles.icon} />
                                                    <span className={styles.openStatus}>{settings.locations_open_label}</span>
                                                    <span className={styles.hours}>• {branch.hours || "9AM - 5PM"}</span>
                                                </div>
                                            </div>

                                            <div className={styles.services}>
                                                {branch.hasAtm && (
                                                    <span className={styles.serviceTag}><CheckCircle2 size={12} /> {settings.locations_tag_atm}</span>
                                                )}
                                                {branch.hasDriveThru && (
                                                    <span className={styles.serviceTag}><CheckCircle2 size={12} /> {settings.locations_tag_drive_thru}</span>
                                                )}
                                                <span className={styles.serviceTag}><CheckCircle2 size={12} /> {settings.locations_tag_notary}</span>
                                            </div>
                                            <div className={styles.actions}>
                                                <a
                                                    href={googleMapsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${styles.navBtn} ${styles.fullWidthBtn}`}
                                                >
                                                    <Navigation size={14} /> {settings.locations_directions_btn_text}
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT: MAP */}
                    <div className={styles.mapCol}>
                        <BranchMap branches={filteredBranches} />
                    </div>

                </div>
            </div>
        </div>
    );
}