/**
 * GLB composition inspector — where do the bytes live?
 * Usage: npx tsx scripts/inspect-glb.ts <path-to.glb>
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { inspect } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error('Usage: npx tsx scripts/inspect-glb.ts <path-to.glb>');
    process.exit(1);
  }
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
    'draco3d.decoder': await draco3d.createDecoderModule(),
  });
  const doc = await io.read(path);
  const rep = inspect(doc);

  const meshTotal = rep.meshes.properties.reduce((s, m) => s + m.size, 0);
  const texTotal = rep.textures.properties.reduce((s, t) => s + t.size, 0);
  console.log(`meshes: ${rep.meshes.properties.length}  ${(meshTotal / 1e6).toFixed(1)} MB`);
  console.log(`textures: ${rep.textures.properties.length}  ${(texTotal / 1e6).toFixed(1)} MB`);

  for (const t of rep.textures.properties.slice(0, 10)) {
    console.log(`  tex ${t.resolution} ${t.mimeType} ${(t.size / 1e6).toFixed(1)} MB slots:${t.slots.join(',')}`);
  }
  for (const m of rep.meshes.properties.slice(0, 6)) {
    console.log(
      `  mesh verts:${m.vertices} prims:${m.glPrimitives} ${(m.size / 1e6).toFixed(1)} MB attrs:${m.attributes.join(',')} mode:${m.mode.join(',')}`
    );
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
