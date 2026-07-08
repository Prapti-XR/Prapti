/**
 * Asset delivery baseline measurement (ROADMAP Phase 3, stage 1)
 * Lists every MODEL_3D / PANORAMA_360 asset with its DB fileSize, the actual
 * R2 object size, cache headers, and a cold download timing.
 *
 * Usage: npx tsx scripts/measure-assets.ts
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient({ log: ['error'] });

function fmt(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

async function main() {
  const assets = await prisma.asset.findMany({
    where: { type: { in: ['MODEL_3D', 'PANORAMA_360'] } },
    select: { siteId: true, type: true, storageKey: true, storageUrl: true, fileSize: true },
    orderBy: [{ siteId: 'asc' }, { type: 'asc' }],
  });

  console.log(`\n${assets.length} assets (MODEL_3D + PANORAMA_360)\n`);
  let total = 0;

  for (const a of assets) {
    try {
      const t0 = Date.now();
      const res = await fetch(a.storageUrl);
      const buf = await res.arrayBuffer();
      const ms = Date.now() - t0;
      const size = buf.byteLength;
      total += size;
      console.log(
        `${a.siteId.padEnd(14)} ${a.type.padEnd(13)} ${fmt(size).padStart(9)}  ` +
        `dl=${ms}ms  cc=${res.headers.get('cache-control') || 'none'}  db=${fmt(Number(a.fileSize))}`
      );
      console.log(`  ${a.storageKey}`);
    } catch (e: any) {
      console.log(`${a.siteId} ${a.type} FETCH FAILED: ${e.message}`);
    }
  }

  console.log(`\nTOTAL payload: ${fmt(total)}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
