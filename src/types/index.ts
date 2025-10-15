/**
 * TypeScript Type Definitions
 */

import type { HeritageSite, Asset, User, AssetType } from '@prisma/client';

// Extended types with relations
export type HeritageSiteWithAssets = HeritageSite & {
  assets: Asset[];
};

export type AssetWithSite = Asset & {
  site: HeritageSite;
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface SiteFormData {
  name: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  country: string;
  city?: string;
  era?: string;
  yearBuilt?: number;
  culturalContext?: string;
  historicalFacts?: string;
  visitingInfo?: string;
  accessibility?: string;
}

export interface AssetFormData {
  title: string;
  description?: string;
  type: AssetType;
  file: File;
}

// Map types
export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// 3D types
export interface ModelMetadata {
  polygonCount: number;
  textureCount: number;
  format: string;
  fileSize: number;
}

export interface PanoramaMetadata {
  type: '360' | '180';
  width: number;
  height: number;
  fileSize: number;
}

// User types
export type UserWithoutPassword = Omit<User, 'passwordHash'>;

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

// Export Prisma types for convenience
export type { HeritageSite, Asset, User, AssetType };
