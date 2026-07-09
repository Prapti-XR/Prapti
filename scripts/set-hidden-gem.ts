/**
 * Toggle a site's Hidden Gem flag.
 * Usage: npx tsx scripts/set-hidden-gem.ts <siteId> [on|off]
 */
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const [siteId, state = 'on'] = process.argv.slice(2);
if (!siteId) {
  console.error('Usage: npx tsx scripts/set-hidden-gem.ts <siteId> [on|off]');
  process.exit(1);
}

const prisma = new PrismaClient({ log: ['error'] });

prisma.heritageSite
  .update({ where: { id: siteId }, data: { isHiddenGem: state !== 'off' } })
  .then((s) => {
    console.log(`${s.id}: isHiddenGem = ${s.isHiddenGem}`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
