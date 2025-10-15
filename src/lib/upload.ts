/**
 * R2 Upload Utilities
 * Functions for uploading assets to Cloudflare R2
 */

import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET, generateAssetKey, getR2PublicUrl } from './r2';

export interface UploadOptions {
  siteId: string;
  assetType: 'models' | 'panoramas' | 'images' | 'thumbnails';
  file: File;
  contentType: string;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
}

/**
 * Upload a file to R2 storage
 */
export async function uploadToR2(options: UploadOptions): Promise<UploadResult> {
  const { siteId, assetType, file, contentType } = options;
  
  const key = generateAssetKey(siteId, assetType, file.name);
  const buffer = await file.arrayBuffer();
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: contentType,
    Metadata: {
      siteId,
      assetType,
      originalName: file.name,
    },
  });

  await r2Client.send(command);

  return {
    key,
    url: getR2PublicUrl(key),
    size: file.size,
  };
}

/**
 * Generate a presigned URL for direct upload
 * Useful for client-side uploads
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for download
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}
