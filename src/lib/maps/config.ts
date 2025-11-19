import { customMapStyles } from './styles';

export const mapConfig = {
  defaultCenter: { lat: 15.2993, lng: 74.1240 }, // Karnataka, India
  defaultZoom: 8,
  minZoom: 3,
  maxZoom: 20,
  gestureHandling: 'greedy' as const,
  disableDefaultUI: true,
  zoomControl: true,
  zoomControlOptions: {
    position: 6, // google.maps.ControlPosition.LEFT_BOTTOM
  },
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  fullscreenControlOptions: {
    position: 6, // google.maps.ControlPosition.LEFT_BOTTOM
  },
};

export const mapOptions: google.maps.MapOptions = {
  ...mapConfig,
  styles: customMapStyles,
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180,
    },
    strictBounds: false,
  },
};
