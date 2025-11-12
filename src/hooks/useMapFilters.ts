import { useState, useCallback } from 'react';

export interface MapFilters {
  era?: string;
  category?: string;
  country?: string;
  radius?: number; // km
  showOnlyWithAR?: boolean;
  showOnlyWith3D?: boolean;
  showOnlyWithPanorama?: boolean;
}

export function useMapFilters(initialFilters: MapFilters = {}) {
  const [filters, setFilters] = useState<MapFilters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilter = useCallback((key: keyof MapFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const toggleFilterPanel = useCallback(() => {
    setIsFilterOpen((prev) => !prev);
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    isFilterOpen,
    toggleFilterPanel,
  };
}
