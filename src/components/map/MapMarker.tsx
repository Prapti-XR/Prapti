'use client';

import { Marker } from '@react-google-maps/api';
import type { HeritageSiteWithAssets } from '@/types';

interface MapMarkerProps {
    site: HeritageSiteWithAssets;
    isSelected: boolean;
    isHovered: boolean;
    onClick: () => void;
    onMouseOver: () => void;
    onMouseOut: () => void;
}

export function MapMarker({
    site,
    isSelected,
    isHovered,
    onClick,
    onMouseOver,
    onMouseOut,
}: MapMarkerProps) {
    // Custom marker icon based on site category
    const icon = {
        url: getMarkerIcon(site, isSelected, isHovered),
        scaledSize: new google.maps.Size(
            isSelected ? 48 : isHovered ? 40 : 36,
            isSelected ? 48 : isHovered ? 40 : 36
        ),
        anchor: new google.maps.Point(
            isSelected ? 24 : isHovered ? 20 : 18,
            isSelected ? 48 : isHovered ? 40 : 36
        ),
    };

    return (
        <Marker
            position={{ lat: site.latitude, lng: site.longitude }}
            icon={icon}
            onClick={onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
        />
    );
}

// Helper function to get marker icon
function getMarkerIcon(
    _site: HeritageSiteWithAssets,
    isSelected: boolean,
    isHovered: boolean
): string {
    const color = isSelected
        ? '#8B4513' // heritage-primary
        : isHovered
            ? '#D2691E' // heritage-secondary
            : '#CD853F'; // heritage-accent

    // SVG marker icon
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `)}`;
}
