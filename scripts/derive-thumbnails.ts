/**
 * Derive hero thumbnails for sites that have no photos.
 * Takes each site's 360° panorama, center-crops a 16:9 view (the "front" of
 * the panorama), and uploads it as a THUMBNAIL asset. Map preview cards,
 * nearby-site strips, site heroes, and OG share cards all pick up THUMBNAILs.
 * Idempotent: skips sites that already have a THUMBNAIL or IMAGE.
 *
 * Usage: npx tsx scripts/derive-thumbnails.ts --yes
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import { ASSET_CACHE_CONTROL } from '../src/lib/optimize';

config();

const CONFIRMED = process.argv.includes('--yes');
const prisma = new PrismaClient({ log: ['error'] });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

async function main() {
  if (!CONFIRMED) {
    console.log('Writes to DB + R2. Run with --yes to proceed.');
    process.exit(1);
  }
  const sharp = (await import('sharp')).default;

  const sites = await prisma.heritageSite.findMany({
    select: {
      id: true,
      name: true,
      assets: { select: { id: true, type: true, storageUrl: true, uploadedById: true } },
    },
  });

  for (const site of sites) {
    if (site.assets.some((a) => a.type === 'THUMBNAIL' || a.type === 'IMAGE')) {
      console.log(`${site.id}: already has imagery, skipping`);
      continue;
    }
    const pano = site.assets.find((a) => a.type === 'PANORAMA_360');
    if (!pano) {
      console.log(`${site.id}: no panorama to derive from, skipping`);
      continue;
    }

    const res = await fetch(pano.storageUrl);
    if (!res.ok) {
      console.log(`${site.id}: panorama fetch failed (${res.status})`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    const w = meta.width ?? 4096;
    const h = meta.height ?? 2048;

    // Center of the equirectangular image ≈ the view straight ahead.
    const cropW = Math.min(Math.round(h * (16 / 9) * 0.9), w);
    const cropH = Math.round(cropW * (9 / 16));
    const left = Math.round((w - cropW) / 2);
    // Slightly above vertical center — horizons sit there in most shots.
    const top = Math.max(0, Math.round(h / 2 - cropH * 0.55));

    const out = await sharp(buf)
      .extract({ left, top, width: cropW, height: Math.min(cropH, h - top) })
      .resize({ width: 1600 })
      .jpeg({ quality: 80, progressive: true, mozjpeg: true })
      .toBuffer();
    const thumb = Buffer.from(new Uint8Array(out));

    const key = `sites/${site.id}/thumbnails/${Date.now()}-hero.jpg`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: thumb,
        ContentType: 'image/jpeg',
        CacheControl: ASSET_CACHE_CONTROL,
      })
    );

    const outMeta = await sharp(thumb).metadata();
    await prisma.asset.create({
      data: {
        type: 'THUMBNAIL',
        title: `${site.name} — view`,
        storageKey: key,
        storageUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
        fileSize: BigInt(thumb.length),
        mimeType: 'image/jpeg',
        width: outMeta.width ?? null,
        height: outMeta.height ?? null,
        isProcessed: true,
        isPublic: true,
        status: 'APPROVED',
        attribution: 'Derived from the site panorama',
        siteId: site.id,
        uploadedById: pano.uploadedById,
      },
    });
    console.log(`${site.id}: thumbnail created (${(thumb.length / 1024).toFixed(0)} KB)`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
