/**
 * Asset optimizer (ROADMAP Phase 3, stages 2–4)
 *
 * Downloads every MODEL_3D / PANORAMA_360 asset from R2, compresses it, and
 * re-uploads to the SAME storage key (URLs stay stable everywhere) with
 * long-lived cache headers. Updates Asset.fileSize / isProcessed in the DB.
 *
 * - GLB models: glTF-Transform pipeline — dedup, prune, weld, Meshopt
 *   compression (EXT_meshopt_compression) + WebP textures capped at 2048px
 *   (EXT_texture_webp). Both are decoded natively by three 0.169 /
 *   drei useGLTF (Meshopt decoder is wired by default in drei 9.115).
 * - 360° panoramas: sharp — resize to max 4096px wide (2:1 kept), JPEG q78
 *   progressive + mozjpeg.
 *
 * Originals are backed up to todelete/asset-originals/ before upload.
 *
 * Usage:
 *   npx tsx scripts/optimize-assets.ts --dry-run   # measure, no writes
 *   npx tsx scripts/optimize-assets.ts --yes       # compress + upload + DB update
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { writeFileSync, mkdirSync } from 'fs';
import { basename, join } from 'path';
import { config } from 'dotenv';
import { optimizeModel, optimizePanorama, ASSET_CACHE_CONTROL } from '../src/lib/optimize';

config();

const DRY_RUN = process.argv.includes('--dry-run');
const CONFIRMED = process.argv.includes('--yes');
const BACKUP_DIR = 'todelete/asset-originals';

const prisma = new PrismaClient({ log: ['error'] });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function fmt(bytes: number): string {
  return bytes >= 1024 * 1024
    ? (bytes / 1024 / 1024).toFixed(1) + ' MB'
    : (bytes / 1024).toFixed(0) + ' KB';
}

async function main() {
  if (!DRY_RUN && !CONFIRMED) {
    console.log('This script overwrites R2 objects and updates the shared DB.');
    console.log('Run with --dry-run to measure, or --yes to proceed.');
    process.exit(1);
  }
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_BUCKET_NAME) {
    console.error('Missing R2 env vars (R2_ACCOUNT_ID, R2_BUCKET_NAME, ...)');
    process.exit(1);
  }

  mkdirSync(BACKUP_DIR, { recursive: true });

  // Optional --type=MODEL_3D / --type=PANORAMA_360 to target one asset class.
  // (Re-running re-compresses; already-optimized files shrink little but lose a
  // generation, so target what you need.)
  const typeArg = process.argv.find((a) => a.startsWith('--type='))?.split('=')[1];
  const types = typeArg ? [typeArg as 'MODEL_3D' | 'PANORAMA_360'] : ['MODEL_3D' as const, 'PANORAMA_360' as const];

  const assets = await prisma.asset.findMany({
    where: { type: { in: types } },
    select: { id: true, siteId: true, type: true, storageKey: true, storageUrl: true, mimeType: true },
    orderBy: [{ siteId: 'asc' }, { type: 'asc' }],
  });

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Optimizing ${assets.length} assets...\n`);
  let beforeTotal = 0;
  let afterTotal = 0;

  for (const a of assets) {
    const label = `${a.siteId} ${a.type} (${basename(a.storageKey)})`;
    try {
      const res = await fetch(a.storageUrl);
      if (!res.ok) throw new Error(`fetch ${res.status}`);
      const original = Buffer.from(await res.arrayBuffer());
      beforeTotal += original.length;

      const optimized =
        a.type === 'MODEL_3D' ? await optimizeModel(original) : await optimizePanorama(original);
      afterTotal += optimized.buffer.length;

      const pct = (100 - (optimized.buffer.length / original.length) * 100).toFixed(0);
      console.log(`${label}\n  ${fmt(original.length)} -> ${fmt(optimized.buffer.length)}  (-${pct}%)`);

      if (!DRY_RUN) {
        // Backup original locally before overwriting
        writeFileSync(join(BACKUP_DIR, basename(a.storageKey)), original);

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: a.storageKey,
            Body: optimized.buffer,
            ContentType: optimized.mimeType,
            CacheControl: ASSET_CACHE_CONTROL,
          })
        );

        await prisma.asset.update({
          where: { id: a.id },
          data: {
            fileSize: BigInt(optimized.buffer.length),
            isProcessed: true,
            ...(optimized.width ? { width: optimized.width, height: optimized.height } : {}),
          },
        });
        console.log('  uploaded + DB updated');
      }
    } catch (e: any) {
      console.error(`${label}\n  FAILED: ${e.message}`);
    }
  }

  console.log(
    `\nTOTAL: ${fmt(beforeTotal)} -> ${fmt(afterTotal)} ` +
    `(-${(100 - (afterTotal / Math.max(beforeTotal, 1)) * 100).toFixed(0)}%)` +
    (DRY_RUN ? '\nDry run only — nothing was written. Re-run with --yes to apply.' : '')
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
