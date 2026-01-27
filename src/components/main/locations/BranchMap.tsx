'use client';

import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import { useMemo, useState, useCallback } from 'react';
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

    const markers = useMemo(() => branches, [branches]);

    const onLoad = useCallback((map: google.maps.Map) => {
        const bounds = new window.google.maps.LatLngBounds();

        markers.forEach(marker => {
            bounds.extend({ lat: marker.lat, lng: marker.lng });
        });

        if (markers.length > 1) {
            map.fitBounds(bounds);
        } else if (markers.length === 1) {
            map.setCenter({ lat: markers[0].lat, lng: markers[0].lng });
            map.setZoom(14);
        } else {
            map.setZoom(4);
        }

        setMap(map);
    }, [markers]);

    const onUnmount = useCallback(() => setMap(null), []);

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
            {markers.map((marker) => (
                <MarkerF
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    title={marker.name}
                />
            ))}
        </GoogleMap>
    );
}