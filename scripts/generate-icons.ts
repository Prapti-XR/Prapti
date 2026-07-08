/**
 * PWA icon generator — renders public/icons/icon.svg into the PNG set the
 * manifest needs. Re-run any time the SVG changes:
 *   npx tsx scripts/generate-icons.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ICON_DIR = 'public/icons';
const BRAND_BG = '#8B4513'; // heritage-secondary — matches manifest theme_color

async function main() {
  const sharp = (await import('sharp')).default;
  const svg = readFileSync(join(ICON_DIR, 'icon.svg'));

  // Standard icons: straight render
  for (const size of [192, 512]) {
    const out = await sharp(svg).resize(size, size).png().toBuffer();
    writeFileSync(join(ICON_DIR, `icon-${size}.png`), out);
    console.log(`icon-${size}.png  (${(out.length / 1024).toFixed(0)} KB)`);
  }

  // Maskable icons: art shrunk to ~78% inside a full-bleed brand background,
  // so any platform mask (circle, squircle) never clips the artwork.
  for (const size of [192, 512]) {
    const inner = Math.round(size * 0.78);
    const offset = Math.round((size - inner) / 2);
    const art = await sharp(svg).resize(inner, inner).png().toBuffer();
    const out = await sharp({
      create: { width: size, height: size, channels: 4, background: BRAND_BG },
    })
      .composite([{ input: art, top: offset, left: offset }])
      .png()
      .toBuffer();
    writeFileSync(join(ICON_DIR, `icon-maskable-${size}.png`), out);
    console.log(`icon-maskable-${size}.png  (${(out.length / 1024).toFixed(0)} KB)`);
  }

  // iOS home-screen icon
  const apple = await sharp(svg).resize(180, 180).png().toBuffer();
  writeFileSync(join(ICON_DIR, 'apple-touch-icon.png'), apple);
  console.log(`apple-touch-icon.png  (${(apple.length / 1024).toFixed(0)} KB)`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
