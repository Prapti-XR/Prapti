/**
 * Cloudflare R2 Storage Client
 * S3-compatible storage for 3D models, panoramas, and images
 */

import { S3Client } from '@aws-sdk/client-s3';
import { env } from '@/env';

// Configure R2 client with S3-compatible API
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET = env.R2_BUCKET_NAME;
export const R2_PUBLIC_URL = env.R2_PUBLIC_URL;

/**
 * Generate public URL for an R2 object
 */
export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Get proxied URL for R2 assets (to avoid CORS issues)
 * Use this in browser/client-side code when loading 3D models or images
 */
export function getProxiedAssetUrl(storageUrl: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return direct URL
    return storageUrl;
  }
  
  // Client-side: use proxy to avoid CORS issues
  // Only proxy if CORS is not configured on R2
  const useProxy = process.env.NEXT_PUBLIC_USE_ASSET_PROXY === 'true';
  
  if (useProxy) {
    return `/api/proxy-asset?url=${encodeURIComponent(storageUrl)}`;
  }
  
  return storageUrl;
}

/**
 * Generate storage key for assets
 */
export function generateAssetKey(
  siteId: string,
  assetType: 'models' | 'panoramas' | 'images' | 'thumbnails',
  filename: string
): string {
  const timestamp = Date.now();
  return `sites/${siteId}/${assetType}/${timestamp}-${filename}`;
}
