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



//GOOGLE API

// 'use client';

// import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
// import { useState, useCallback, useEffect } from 'react';
// import { Loader2 } from 'lucide-react';
// import styles from './locations.module.css';

// interface BranchLocation {
//     id: string;
//     name: string;
//     lat: number;
//     lng: number;
// }

// interface BranchMapProps {
//     branches: BranchLocation[];
// }

// // Default view (USA Wide)
// const defaultCenter = { lat: 39.8283, lng: -98.5795 };

// export default function BranchMap({ branches }: BranchMapProps) {
//     const { isLoaded } = useJsApiLoader({
//         id: 'google-map-script',
//         googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
//     });

//     const [map, setMap] = useState<google.maps.Map | null>(null);

//     const onLoad = useCallback((map: google.maps.Map) => {
//         setMap(map);
//     }, []);

//     const onUnmount = useCallback(() => setMap(null), []);

//     useEffect(() => {
//         if (!map || !branches) return;

//         if (branches.length === 0) {
//             map.setCenter(defaultCenter);
//             map.setZoom(4);
//             return;
//         }

//         const bounds = new window.google.maps.LatLngBounds();
//         let hasValidCoords = false;

//         branches.forEach((branch) => {
//             if (branch.lat && branch.lng) {
//                 bounds.extend({ lat: branch.lat, lng: branch.lng });
//                 hasValidCoords = true;
//             }
//         });

//         if (!hasValidCoords) return;

//         // 2. INTELLIGENT ZOOM HANDLING
//         if (branches.length === 1 || bounds.getNorthEast().equals(bounds.getSouthWest())) {
//             map.setCenter(bounds.getNorthEast());
//             map.setZoom(14);
//         } else {
//             map.fitBounds(bounds, {
//                 top: 50,
//                 right: 50,
//                 bottom: 50,
//                 left: 50
//             });
//         }

//     }, [map, branches]);

//     if (!isLoaded) {
//         return (
//             <div className={styles.loaderContainer}>
//                 <Loader2 className={styles.spin} size={32} color="var(--text-muted)" />
//             </div>
//         );
//     }

//     return (
//         <GoogleMap
//             mapContainerClassName={styles.mapContainer}
//             center={defaultCenter}
//             zoom={4}
//             onLoad={onLoad}
//             onUnmount={onUnmount}
//             options={{
//                 disableDefaultUI: false,
//                 zoomControl: true,
//                 streetViewControl: false,
//                 mapTypeControl: false,
//                 styles: [
//                     { featureType: "poi", stylers: [{ visibility: "off" }] }
//                 ]
//             }}
//         >
//             {branches.map((marker) => (
//                 <MarkerF
//                     key={marker.id}
//                     position={{ lat: marker.lat, lng: marker.lng }}
//                     title={marker.name}
//                 />
//             ))}
//         </GoogleMap>
//     );
// }