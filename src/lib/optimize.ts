/**
 * Server-side asset optimization (shared by /api/upload and scripts/)
 *
 * - MODEL_3D (.glb): glTF-Transform — dedup, prune, weld, WebP textures,
 *   Draco geometry compression. three 0.169 / drei 9.115 decode both natively
 *   (drei wires the Draco + Meshopt decoders by default in useGLTF).
 *   Note: dense photogrammetry resists mesh *simplification* (UV-seam locks),
 *   which is why Draco *compression* is the lever here.
 * - PANORAMA (360/180 jpg/png): resize to max 4096px wide, progressive JPEG q78.
 * - IMAGE/THUMBNAIL: resize to max 2560px, progressive JPEG q80.
 *
 * All heavy packages are imported dynamically so cold paths never pay for
 * them; they are listed in next.config.js serverComponentsExternalPackages
 * (native/WASM — must not be bundled). Proven results (2026-07-08): total
 * seeded payload 185 MB -> 10.2 MB, worst model 122.9 MB -> 3.6 MB.
 */

export const ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';

export interface OptimizedAsset {
  buffer: Buffer;
  mimeType: string;
  width: number | null;
  height: number | null;
}

/** Compress a GLB: Draco geometry + WebP textures. */
export async function optimizeModel(input: Buffer): Promise<OptimizedAsset> {
  const [{ NodeIO }, { ALL_EXTENSIONS }, { dedup, prune, weld, draco, textureCompress }, draco3d, sharp] =
    await Promise.all([
      import('@gltf-transform/core'),
      import('@gltf-transform/extensions'),
      import('@gltf-transform/functions'),
      import('draco3dgltf').then((m) => m.default ?? m),
      import('sharp').then((m) => m.default ?? m),
    ]);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.encoder': await draco3d.createEncoderModule(),
    'draco3d.decoder': await draco3d.createDecoderModule(),
  });

  const doc = await io.readBinary(new Uint8Array(input));

  // Tiled photogrammetry scans carry many per-chunk textures; cap harder.
  const mb = input.length / 1024 / 1024;
  const textureCap = mb > 50 ? 1024 : 2048;

  await doc.transform(
    dedup(),
    prune(),
    weld(),
    textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [textureCap, textureCap] }),
    draco({ quantizePosition: 12, quantizeTexcoord: 10, quantizeNormal: 8 })
  );

  return {
    buffer: Buffer.from(await io.writeBinary(doc)),
    mimeType: 'model/gltf-binary',
    width: null,
    height: null,
  };
}

/** Recompress an equirectangular panorama: max 4096px wide, progressive JPEG. */
export async function optimizePanorama(input: Buffer): Promise<OptimizedAsset> {
  const sharp = await import('sharp').then((m) => m.default ?? m);
  const meta = await sharp(input).metadata();
  const pipeline = sharp(input);
  if ((meta.width ?? 0) > 4096) pipeline.resize({ width: 4096 });
  const out = await pipeline.jpeg({ quality: 78, progressive: true, mozjpeg: true }).toBuffer();
  const outMeta = await sharp(out).metadata();
  return {
    // sharp may return a SharedArrayBuffer-backed Buffer, which the AWS SDK rejects — copy it.
    buffer: Buffer.from(new Uint8Array(out)),
    mimeType: 'image/jpeg',
    width: outMeta.width ?? null,
    height: outMeta.height ?? null,
  };
}

/** Recompress a photo/thumbnail: max 2560px, progressive JPEG. */
export async function optimizeImage(input: Buffer): Promise<OptimizedAsset> {
  const sharp = await import('sharp').then((m) => m.default ?? m);
  const meta = await sharp(input).metadata();
  const pipeline = sharp(input);
  if ((meta.width ?? 0) > 2560) pipeline.resize({ width: 2560 });
  const out = await pipeline.jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer();
  const outMeta = await sharp(out).metadata();
  return {
    buffer: Buffer.from(new Uint8Array(out)),
    mimeType: 'image/jpeg',
    width: outMeta.width ?? null,
    height: outMeta.height ?? null,
  };
}

/**
 * Optimize by upload category. Never throws: on failure returns the original
 * bytes (an unoptimized upload beats a failed one) with `optimized: false`.
 */
export async function optimizeAsset(
  category: 'models' | 'panoramas' | 'images' | 'thumbnails',
  input: Buffer,
  originalMimeType: string
): Promise<OptimizedAsset & { optimized: boolean }> {
  try {
    const result =
      category === 'models'
        ? await optimizeModel(input)
        : category === 'panoramas'
          ? await optimizePanorama(input)
          : await optimizeImage(input);
    // Guard against pathological cases where "optimization" grows the file.
    if (result.buffer.length >= input.length) {
      return { buffer: input, mimeType: originalMimeType, width: result.width, height: result.height, optimized: false };
    }
    return { ...result, optimized: true };
  } catch (error) {
    console.error(`Asset optimization failed (${category}), uploading original:`, error);
    return { buffer: input, mimeType: originalMimeType, width: null, height: null, optimized: false };
  }
}
