'use client';

import { useCallback, useState } from 'react';
import { GoogleMap as ReactGoogleMap } from '@react-google-maps/api';
import { mapOptions } from '@/lib/maps/config';
import type { MapCoordinates, MapBounds } from '@/types';

interface GoogleMapProps {
    center: MapCoordinates;
    zoom?: number;
    onBoundsChanged?: (bounds: MapBounds) => void;
    onMapLoad?: (map: google.maps.Map) => void;
    onClick?: () => void;
    children?: React.ReactNode;
}

const containerStyle = {
    width: '100%',
    height: '100%',
};

export function GoogleMap({
    center,
    zoom = 10,
    onBoundsChanged,
    onMapLoad,
    onClick,
    children,
}: GoogleMapProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(
        (mapInstance: google.maps.Map) => {
            setMap(mapInstance);
            onMapLoad?.(mapInstance);
        },
        [onMapLoad]
    );

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const handleBoundsChanged = useCallback(() => {
        if (!map) return;

        const bounds = map.getBounds();
        if (bounds) {
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            onBoundsChanged?.({
                north: ne.lat(),
                south: sw.lat(),
                east: ne.lng(),
                west: sw.lng(),
            });
        }
    }, [map, onBoundsChanged]);

    return (
        <ReactGoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onBoundsChanged={handleBoundsChanged}
            onClick={onClick}
            options={mapOptions}
        >
            {children}
        </ReactGoogleMap>
    );
}
