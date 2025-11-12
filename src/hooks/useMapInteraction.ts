import { useState, useCallback, useRef } from 'react';
import type { HeritageSiteWithAssets } from '@/types';
import { panToMarker } from '@/lib/maps/utils';

interface MapInteractionState {
  selectedSite: HeritageSiteWithAssets | null;
  hoveredMarkerId: string | null;
  isPreviewCardOpen: boolean;
  mapInstance: google.maps.Map | null;
}

export function useMapInteraction() {
  const [state, setState] = useState<MapInteractionState>({
    selectedSite: null,
    hoveredMarkerId: null,
    isPreviewCardOpen: false,
    mapInstance: null,
  });

  // Store previous selected site for animation
  const prevSelectedSiteRef = useRef<HeritageSiteWithAssets | null>(null);

  // Handle marker click - open preview card
  const handleMarkerClick = useCallback(
    (site: HeritageSiteWithAssets) => {
      setState((prev) => ({
        ...prev,
        selectedSite: site,
        isPreviewCardOpen: true,
      }));

      prevSelectedSiteRef.current = site;

      // Pan map to center on marker (with offset for card)
      if (state.mapInstance) {
        const offset = window.innerWidth < 768 ? 0 : 200; // Desktop sidebar offset
        panToMarker(state.mapInstance, site.latitude, site.longitude, offset);
      }
    },
    [state.mapInstance]
  );

  // Handle marker hover
  const handleMarkerHover = useCallback((siteId: string | null) => {
    setState((prev) => ({
      ...prev,
      hoveredMarkerId: siteId,
    }));
  }, []);

  // Close preview card
  const closePreviewCard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPreviewCardOpen: false,
    }));

    // Delay clearing selected site for exit animation
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        selectedSite: null,
      }));
    }, 300);
  }, []);

  // Handle map click (close card)
  const handleMapClick = useCallback(() => {
    if (state.isPreviewCardOpen) {
      closePreviewCard();
    }
  }, [state.isPreviewCardOpen, closePreviewCard]);

  // Set map instance
  const setMapInstance = useCallback((map: google.maps.Map | null) => {
    setState((prev) => ({
      ...prev,
      mapInstance: map,
    }));
  }, []);

  // Quick action handlers
  const handleView3D = useCallback((siteId: string) => {
    // Navigate to site page with 3D view
    window.location.href = `/site/${siteId}?view=3d`;
  }, []);

  const handleViewAR = useCallback((siteId: string) => {
    // Navigate to site page with AR view
    window.location.href = `/site/${siteId}?view=ar`;
  }, []);

  const handleViewVR = useCallback((siteId: string) => {
    // Navigate to site page with VR view
    window.location.href = `/site/${siteId}?view=vr`;
  }, []);

  const handleViewDetails = useCallback((siteId: string) => {
    // Navigate to full site details
    window.location.href = `/site/${siteId}`;
  }, []);

  return {
    selectedSite: state.selectedSite,
    hoveredMarkerId: state.hoveredMarkerId,
    isPreviewCardOpen: state.isPreviewCardOpen,
    handleMarkerClick,
    handleMarkerHover,
    handleMapClick,
    closePreviewCard,
    setMapInstance,
    // Quick actions
    handleView3D,
    handleViewAR,
    handleViewVR,
    handleViewDetails,
  };
}
