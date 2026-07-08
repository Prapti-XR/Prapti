/**
 * Bulk site importer (ROADMAP Phase 1)
 *
 * Imports heritage sites + assets + trivia + tags from a content folder,
 * optimizing every asset (Draco/WebP models, recompressed panoramas/photos)
 * before uploading to R2 with immutable cache headers.
 *
 * Folder convention:
 *   <folder>/data.json               — same shape as docs/example-data/data.json:
 *                                      { heritageSites: [{ siteRef?, name, ... }],
 *                                        triviaQuestions: [{ siteRef, ... }],
 *                                        tags: [{ name, slug }] }
 *   <folder>/assets/<siteRef>/*      — .glb models, panoramas (filename contains
 *                                      "360"/"pano" OR image is ~2:1), photos.
 *
 * `siteRef` becomes the site's stable slug id (falls back to slugified name).
 * Idempotent: sites upsert by id; an asset is skipped when one with the same
 * title already exists on the site; trivia skips duplicate question text.
 *
 * Usage:
 *   npx tsx scripts/import-sites.ts <folder> --dry-run   # show the plan
 *   npx tsx scripts/import-sites.ts <folder> --yes       # apply (writes DB + R2)
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { config } from 'dotenv';
import {
  optimizeModel,
  optimizePanorama,
  optimizeImage,
  ASSET_CACHE_CONTROL,
  type OptimizedAsset,
} from '../src/lib/optimize';

config();

const DRY_RUN = process.argv.includes('--dry-run');
const CONFIRMED = process.argv.includes('--yes');
const folder = process.argv[2];

const prisma = new PrismaClient({ log: ['error'] });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function fmt(bytes: number): string {
  return bytes >= 1024 * 1024
    ? (bytes / 1024 / 1024).toFixed(1) + ' MB'
    : (bytes / 1024).toFixed(0) + ' KB';
}

type AssetKind = 'models' | 'panoramas' | 'images';

async function classifyFile(path: string): Promise<AssetKind | null> {
  const ext = extname(path).toLowerCase();
  if (ext === '.glb' || ext === '.gltf') return 'models';
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return null;
  const name = basename(path).toLowerCase();
  if (name.includes('360') || name.includes('pano')) return 'panoramas';
  // Equirectangular panoramas are ~2:1
  try {
    const sharp = await import('sharp').then((m) => m.default ?? m);
    const meta = await sharp(path).metadata();
    if (meta.width && meta.height && Math.abs(meta.width / meta.height - 2) < 0.2) {
      return 'panoramas';
    }
  } catch {
    /* fall through to image */
  }
  return 'images';
}

async function uploadAsset(
  siteId: string,
  kind: AssetKind,
  filePath: string,
  adminId: string
): Promise<void> {
  const filename = basename(filePath);
  const title = filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');

  // Idempotency: skip if an asset with this title already exists on the site
  const existing = await prisma.asset.findFirst({
    where: { siteId, title },
    select: { id: true },
  });
  if (existing) {
    console.log(`    ~ ${filename} already imported, skipping`);
    return;
  }

  const original = readFileSync(filePath);
  let optimized: OptimizedAsset;
  if (kind === 'models') optimized = await optimizeModel(original);
  else if (kind === 'panoramas') optimized = await optimizePanorama(original);
  else optimized = await optimizeImage(original);

  console.log(`    + ${filename}: ${fmt(original.length)} -> ${fmt(optimized.buffer.length)}`);
  if (DRY_RUN) return;

  const key = `sites/${siteId}/${kind}/${Date.now()}-${filename}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: optimized.buffer,
      ContentType: optimized.mimeType,
      CacheControl: ASSET_CACHE_CONTROL,
    })
  );

  await prisma.asset.create({
    data: {
      type: kind === 'models' ? 'MODEL_3D' : kind === 'panoramas' ? 'PANORAMA_360' : 'IMAGE',
      title,
      storageKey: key,
      storageUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
      fileSize: BigInt(optimized.buffer.length),
      mimeType: optimized.mimeType,
      format: kind === 'models' ? extname(filename).slice(1).toUpperCase() : null,
      isPanorama: kind === 'panoramas',
      panoramaType: kind === 'panoramas' ? '360' : null,
      width: optimized.width,
      height: optimized.height,
      isProcessed: true,
      isPublic: true,
      status: 'APPROVED',
      siteId,
      uploadedById: adminId,
    },
  });
}

async function main() {
  if (!folder || (!DRY_RUN && !CONFIRMED)) {
    console.log('Usage: npx tsx scripts/import-sites.ts <folder> --dry-run | --yes');
    console.log('       --yes writes to the shared DB and R2 bucket.');
    process.exit(1);
  }
  const dataPath = join(folder, 'data.json');
  if (!existsSync(dataPath)) {
    console.error(`No data.json found in ${folder}`);
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(dataPath, 'utf8'));
  const sites: any[] = data.heritageSites ?? data.sites ?? [];
  const trivia: any[] = data.triviaQuestions ?? [];
  const tags: any[] = data.tags ?? [];

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  if (!admin) {
    console.error('No ADMIN user found — create one before importing.');
    process.exit(1);
  }

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Importing ${sites.length} sites from ${folder}\n`);

  // 1. Tags (global)
  for (const t of tags) {
    console.log(`tag: ${t.name} (${t.slug})`);
    if (!DRY_RUN) {
      await prisma.tag.upsert({
        where: { slug: t.slug },
        update: { name: t.name },
        create: { name: t.name, slug: t.slug },
      });
    }
  }

  // 2. Sites
  for (const s of sites) {
    const id = s.siteRef || slugify(s.name);
    console.log(`\nsite: ${s.name} (id=${id})`);

    const siteData = {
      name: s.name,
      description: s.description,
      location: s.location,
      latitude: s.latitude,
      longitude: s.longitude,
      country: s.country,
      city: s.city ?? null,
      era: s.era ?? null,
      yearBuilt: s.yearBuilt ?? null,
      culturalContext: s.culturalContext ?? null,
      historicalFacts: s.historicalFacts ?? null,
      visitingInfo: s.visitingInfo ?? null,
      accessibility: s.accessibility ?? null,
      isPublished: s.isPublished ?? false,
      isFeatured: s.isFeatured ?? false,
    };

    if (!siteData.name || !siteData.description || !siteData.location || siteData.latitude == null || siteData.longitude == null || !siteData.country) {
      console.log('  ✗ missing required fields (name/description/location/latitude/longitude/country), skipping');
      continue;
    }

    if (!DRY_RUN) {
      await prisma.heritageSite.upsert({
        where: { id },
        update: siteData,
        create: { id, ...siteData },
      });
      console.log('  ✓ site upserted');
    } else {
      console.log('  ~ would upsert site');
    }

    // 2a. Tag links
    for (const slug of s.tags ?? []) {
      if (DRY_RUN) { console.log(`  ~ tag link: ${slug}`); continue; }
      const tag = await prisma.tag.findUnique({ where: { slug } });
      if (!tag) { console.log(`  ✗ unknown tag "${slug}" (add it to data.json tags)`); continue; }
      await prisma.siteTag.upsert({
        where: { siteId_tagId: { siteId: id, tagId: tag.id } },
        update: {},
        create: { siteId: id, tagId: tag.id },
      });
      console.log(`  ✓ tag link: ${slug}`);
    }

    // 2b. Assets from folder
    const assetDir = join(folder, 'assets', id);
    if (existsSync(assetDir)) {
      for (const f of readdirSync(assetDir)) {
        const p = join(assetDir, f);
        if (statSync(p).isDirectory()) continue;
        const kind = await classifyFile(p);
        if (!kind) { console.log(`    ~ ${f}: unsupported type, skipping`); continue; }
        try {
          await uploadAsset(id, kind, p, admin.id);
        } catch (e: any) {
          console.error(`    ✗ ${f} failed: ${e.message}`);
        }
      }
    } else {
      console.log(`  ~ no assets folder (${assetDir})`);
    }

    // 2c. Trivia for this site
    const siteTrivia = trivia.filter((q) => (q.siteRef || '') === (s.siteRef || id));
    for (const q of siteTrivia) {
      if (DRY_RUN) { console.log(`  ~ trivia: "${String(q.question).slice(0, 50)}..."`); continue; }
      const dup = await prisma.triviaQuestion.findFirst({ where: { siteId: id, question: q.question } });
      if (dup) { console.log('  ~ trivia duplicate, skipping'); continue; }
      await prisma.triviaQuestion.create({
        data: {
          question: q.question,
          difficulty: q.difficulty,
          category: q.category,
          siteId: id,
          answers: { create: (q.answers ?? []).map((a: any) => ({
            answerText: a.answerText,
            isCorrect: Boolean(a.isCorrect),
            explanation: a.explanation ?? null,
          })) },
        },
      });
      console.log(`  ✓ trivia: "${String(q.question).slice(0, 50)}..."`);
    }
  }

  console.log(`\n${DRY_RUN ? 'Dry run complete — re-run with --yes to apply.' : 'Import complete.'}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
