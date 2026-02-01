'use client';

import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import styles from './locations.module.css';

interface BranchLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

interface BranchMapProps {
    branches: BranchLocation[];
}

// Default view (USA Wide)
const defaultCenter = { lat: 39.8283, lng: -98.5795 };

export default function BranchMap({ branches }: BranchMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => setMap(null), []);

    useEffect(() => {
        if (!map || !branches) return;

        // 1. No branches? Show default USA view
        if (branches.length === 0) {
            map.setCenter(defaultCenter);
            map.setZoom(4);
            return;
        }

        const bounds = new window.google.maps.LatLngBounds();
        let hasValidCoords = false;

        branches.forEach((branch) => {
            if (branch.lat && branch.lng) {
                bounds.extend({ lat: branch.lat, lng: branch.lng });
                hasValidCoords = true;
            }
        });

        if (!hasValidCoords) return;

        // 2. INTELLIGENT ZOOM HANDLING
        // If there is only 1 branch OR all branches are at the exact same location
        if (branches.length === 1 || bounds.getNorthEast().equals(bounds.getSouthWest())) {
            map.setCenter(bounds.getNorthEast()); // Center on the pins
            map.setZoom(14); // Set a reasonable street-level zoom
        } else {
            // Otherwise, fit bounds normally to show all spread-out pins
            map.fitBounds(bounds, {
                top: 50,
                right: 50,
                bottom: 50,
                left: 50
            });
        }

    }, [map, branches]);

    if (!isLoaded) {
        return (
            <div className={styles.loaderContainer}>
                <Loader2 className={styles.spin} size={32} color="var(--text-muted)" />
            </div>
        );
    }

    return (
        <GoogleMap
            mapContainerClassName={styles.mapContainer}
            center={defaultCenter}
            zoom={4}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                disableDefaultUI: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                styles: [
                    { featureType: "poi", stylers: [{ visibility: "off" }] }
                ]
            }}
        >
            {branches.map((marker) => (
                <MarkerF
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    title={marker.name}
                />
            ))}
        </GoogleMap>
    );
}