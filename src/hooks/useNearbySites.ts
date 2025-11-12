import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { HeritageSiteWithAssets, MapBounds } from '@/types';
import type { MapFilters } from './useMapFilters';

export function useNearbySites(
  bounds: MapBounds | null,
  filters: MapFilters
) {
  const [sites, setSites] = useState<HeritageSiteWithAssets[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced fetch to avoid excessive API calls on map movement
  const fetchSites = useDebouncedCallback(async () => {
    if (!bounds) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        north: bounds.north.toString(),
        south: bounds.south.toString(),
        east: bounds.east.toString(),
        west: bounds.west.toString(),
        ...(filters.era && { era: filters.era }),
        ...(filters.category && { category: filters.category }),
        ...(filters.country && { country: filters.country }),
        ...(filters.showOnlyWithAR && { hasAR: 'true' }),
        ...(filters.showOnlyWith3D && { has3D: 'true' }),
        ...(filters.showOnlyWithPanorama && { hasPanorama: 'true' }),
      });

      const response = await fetch(`/api/sites/nearby?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch sites');
      }

      const data = await response.json();
      setSites(data.sites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, 500); // 500ms debounce

  useEffect(() => {
    fetchSites();
  }, [bounds, filters, fetchSites]);

  return { sites, loading, error, refetch: fetchSites };
}
