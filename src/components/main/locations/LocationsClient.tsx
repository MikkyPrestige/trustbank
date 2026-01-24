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
}

export default function LocationsClient({ initialBranches }: Props) {
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
                    <h1>Find a Branch or ATM</h1>
                    <div className={styles.searchBar}>
                        <Search className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Enter city, state, or zip..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button>Search</button>
                    </div>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.contentGrid}>

                    {/* LEFT: LIST */}
                    <div className={styles.listCol}>
                        <div className={styles.resultsCount}>
                            {filteredBranches.length} locations found
                        </div>

                        <div className={styles.list}>
                            {filteredBranches.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                    <p>No locations found matching &quot;<strong>{query}</strong>&quot;</p>
                                    <button
                                        onClick={() => setQuery('')}
                                        style={{ marginTop: '10px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            ) : (
                                filteredBranches.map((branch) => {
                                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.address}, ${branch.city}`)}`;

                                    return (
                                        <div key={branch.id} className={styles.branchCard}>
                                            <div className={styles.branchHeader}>
                                                <h3>{branch.name}</h3>
                                                <span className={styles.distanceBadge}>0.8 mi</span>
                                            </div>

                                            <div className={styles.branchDetails}>
                                                <div className={styles.detailRow}>
                                                    <MapPin size={16} className={styles.icon} />
                                                    <span>
                                                        {branch.address}, {branch.city} {branch.state ? `, ${branch.state}` : ''}
                                                    </span>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <Phone size={16} className={styles.icon} />
                                                    <a href={`tel:${branch.phone}`} className={styles.link}>
                                                        {branch.phone}
                                                    </a>
                                                </div>
                                                <div className={styles.detailRow}>
                                                    <Clock size={16} className={styles.icon} />
                                                    <span className={styles.openStatus}>Open Now</span>
                                                    <span className={styles.hours}>• {branch.hours || "9AM - 5PM"}</span>
                                                </div>
                                            </div>

                                            <div className={styles.services}>
                                                {branch.hasAtm && (
                                                    <span className={styles.serviceTag}><CheckCircle2 size={12} /> 24h ATM</span>
                                                )}
                                                {branch.hasDriveThru && (
                                                    <span className={styles.serviceTag}><CheckCircle2 size={12} /> Drive-Thru</span>
                                                )}
                                                <span className={styles.serviceTag}><CheckCircle2 size={12} /> Notary</span>
                                            </div>

                                            <div className={styles.actions}>
                                                <a
                                                    href={googleMapsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`${styles.navBtn} ${styles.fullWidthBtn}`}
                                                >
                                                    <Navigation size={14} /> Get Directions
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* RIGHT: MAP (Passes Filtered Branches!) */}
                    <div className={styles.mapCol}>
                        <BranchMap branches={filteredBranches} />
                    </div>

                </div>
            </div>
        </div>
    );
}