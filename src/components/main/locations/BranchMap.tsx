'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import styles from './locations.module.css';

const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

export default function BranchMap({ branches }: { branches: any[] }) {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        if (!map || !branches || branches.length === 0) return;

        map.invalidateSize();

        const points = branches.map(b => [Number(b.lat), Number(b.lng)] as [number, number]);
        const bounds = L.latLngBounds(points);

        map.fitBounds(bounds, {
            padding: [100, 100],
            maxZoom: 12,
            animate: true
        });

    }, [map, branches]);

    return (
        <MapContainer
            ref={setMap}
            center={[20, 0]}
            zoom={2}
            className={styles.mapContainer}
            scrollWheelZoom={true}
            minZoom={2}
            maxBounds={[[-90, -180], [90, 180]]}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                noWrap={true}
                bounds={[[-90, -180], [90, 180]]}
            />

            {branches.map((branch) => (
                <Marker
                    key={branch.id}
                    position={[Number(branch.lat), Number(branch.lng)]}
                    icon={customIcon}
                >
                    <Popup>
                        <strong>{branch.name}</strong><br />
                        {branch.address}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}