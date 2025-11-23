/**
 * Asset Upload Script
 * Upload images and 3D models to heritage sites via CLI
 * 
 * Usage:
 *   npx tsx scripts/upload-assets.ts
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { basename, extname, join } from 'path';

const prisma = new PrismaClient();

// R2 Configuration (from environment variables)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const R2_BUCKET = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

interface UploadOptions {
  filePath: string;
  siteId: string;
  assetType: 'models' | 'panoramas' | 'images' | 'thumbnails';
  title: string;
  description?: string;
  userId: string; // ADMIN user ID
}

/**
 * Upload a single asset
 */
async function uploadAsset(options: UploadOptions) {
  console.log(`\n📤 Uploading: ${options.filePath}`);

  try {
    // Read file
    const fileBuffer = readFileSync(options.filePath);
    const filename = basename(options.filePath);
    const fileSize = statSync(options.filePath).size;

    // Generate storage key
    const timestamp = Date.now();
    const key = `sites/${options.siteId}/${options.assetType}/${timestamp}-${filename}`;

    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: getContentType(filename),
      Metadata: {
        siteId: options.siteId,
        assetType: options.assetType,
        originalName: filename,
      },
    });

    await r2Client.send(command);
    const storageUrl = `${R2_PUBLIC_URL}/${key}`;

    // Determine asset type enum
    let assetTypeEnum: any;
    if (options.assetType === 'models') {
      assetTypeEnum = 'MODEL_3D';
    } else if (options.assetType === 'panoramas') {
      assetTypeEnum = filename.includes('360') ? 'PANORAMA_360' : 'PANORAMA_180';
    } else if (options.assetType === 'thumbnails') {
      assetTypeEnum = 'THUMBNAIL';
    } else {
      assetTypeEnum = 'IMAGE';
    }

    // Create database record
    const asset = await prisma.asset.create({
      data: {
        type: assetTypeEnum,
        title: options.title,
        description: options.description,
        storageKey: key,
        storageUrl: storageUrl,
        fileSize: BigInt(fileSize),
        mimeType: getContentType(filename),
        format: options.assetType === 'models' ? extname(filename).slice(1).toUpperCase() : null,
        isPanorama: options.assetType === 'panoramas',
        panoramaType: options.assetType === 'panoramas' ? (filename.includes('360') ? '360' : '180') : null,
        isProcessed: true,
        isPublic: true,
        status: 'APPROVED',
        siteId: options.siteId,
        uploadedById: options.userId,
      },
    });

    console.log(`✅ Success! Asset ID: ${asset.id}`);
    console.log(`   URL: ${storageUrl}`);
    return asset;

  } catch (error) {
    console.error(`❌ Upload failed:`, error);
    throw error;
  }
}

/**
 * Get content type from filename
 */
function getContentType(filename: string): string {
  const ext = extname(filename).toLowerCase().slice(1);
  const types: Record<string, string> = {
    'glb': 'model/gltf-binary',
    'gltf': 'model/gltf+json',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Bulk upload from a directory
 */
async function uploadDirectory(options: {
  directoryPath: string;
  siteId: string;
  assetType: 'models' | 'panoramas' | 'images' | 'thumbnails';
  userId: string;
}) {
  console.log(`\n📁 Scanning directory: ${options.directoryPath}`);

  const files = readdirSync(options.directoryPath);
  const results = [];

  for (const file of files) {
    const filePath = join(options.directoryPath, file);
    
    // Skip directories
    if (statSync(filePath).isDirectory()) continue;

    // Skip non-asset files
    const ext = extname(file).toLowerCase();
    if (options.assetType === 'models' && !['.glb', '.gltf'].includes(ext)) continue;
    if (options.assetType !== 'models' && !['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    try {
      const asset = await uploadAsset({
        filePath,
        siteId: options.siteId,
        assetType: options.assetType,
        title: basename(file, ext),
        userId: options.userId,
      });
      results.push({ file, success: true, assetId: asset.id });
    } catch (error) {
      results.push({ file, success: false, error });
    }
  }

  console.log(`\n📊 Upload Summary:`);
  console.log(`   Total files: ${results.length}`);
  console.log(`   Successful: ${results.filter(r => r.success).length}`);
  console.log(`   Failed: ${results.filter(r => !r.success).length}`);

  return results;
}

/**
 * Get or create admin user
 */
async function getAdminUser() {
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!admin) {
    console.log('\n⚠️  No admin user found. Creating default admin...');
    admin = await prisma.user.create({
      data: {
        email: 'admin@prapti.local',
        name: 'Admin User',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Created admin user: ${admin.email} (ID: ${admin.id})`);
  }

  return admin;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Prapti Asset Upload Script\n');

  // Check environment variables
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    console.error('❌ Missing R2 environment variables!');
    console.error('   Required: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL');
    process.exit(1);
  }

  const admin = await getAdminUser();

  // ===========================================================
  // CONFIGURATION: Edit this section for your uploads
  // ===========================================================

  const SITE_ID = 'your-site-id-here'; // Replace with actual site ID

  // Example 1: Upload a single 3D model
  await uploadAsset({
    filePath: './public/models/example-model.glb',
    siteId: SITE_ID,
    assetType: 'models',
    title: 'Example 3D Model',
    description: '3D model of the heritage site',
    userId: admin.id,
  });

  // Example 2: Upload a single image
  await uploadAsset({
    filePath: './public/images/example-photo.jpg',
    siteId: SITE_ID,
    assetType: 'images',
    title: 'Heritage Site Photo',
    description: 'Beautiful view of the site',
    userId: admin.id,
  });

  // Example 3: Bulk upload all models from a directory
  // await uploadDirectory({
  //   directoryPath: './public/models',
  //   siteId: SITE_ID,
  //   assetType: 'models',
  //   userId: admin.id,
  // });

  // Example 4: Bulk upload all images from a directory
  // await uploadDirectory({
  //   directoryPath: './public/images',
  //   siteId: SITE_ID,
  //   assetType: 'images',
  //   userId: admin.id,
  // });

  console.log('\n✨ All uploads complete!');
}

// Execute
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
