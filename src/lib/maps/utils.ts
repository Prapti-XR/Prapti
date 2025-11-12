import type { MapCoordinates, MapBounds } from '@/types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: MapCoordinates,
  coord2: MapCoordinates
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Pan map to marker with offset for preview card
 */
export function panToMarker(
  map: google.maps.Map,
  lat: number,
  lng: number,
  offsetX: number = 0
): void {
  const projection = map.getProjection();
  if (!projection) return;

  const center = new google.maps.LatLng(lat, lng);
  const point = projection.fromLatLngToPoint(center);

  if (point) {
    const scale = Math.pow(2, map.getZoom() || 0);
    const worldPoint = new google.maps.Point(
      point.x - offsetX / scale,
      point.y
    );
    const newCenter = projection.fromPointToLatLng(worldPoint);
    if (newCenter) {
      map.panTo(newCenter);
    }
  }
}

/**
 * Check if a coordinate is within bounds
 */
export function isWithinBounds(
  coord: MapCoordinates,
  bounds: MapBounds
): boolean {
  return (
    coord.lat >= bounds.south &&
    coord.lat <= bounds.north &&
    coord.lng >= bounds.west &&
    coord.lng <= bounds.east
  );
}

/**
 * Get center of bounds
 */
export function getBoundsCenter(bounds: MapBounds): MapCoordinates {
  return {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };
}

/**
 * Extend bounds to include a coordinate
 */
export function extendBounds(
  bounds: MapBounds,
  coord: MapCoordinates
): MapBounds {
  return {
    north: Math.max(bounds.north, coord.lat),
    south: Math.min(bounds.south, coord.lat),
    east: Math.max(bounds.east, coord.lng),
    west: Math.min(bounds.west, coord.lng),
  };
}
