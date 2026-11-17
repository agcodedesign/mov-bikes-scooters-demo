import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
const manifest = [];
await mkdir('public/images/hero', { recursive: true });
for (const name of ['mov-ciclista-orla', 'mov-scooter-cidade', 'mov-mobilidade-orla']) {
  const source = `assets/source/hero-mobile/${name}-mobile-v1.png`;
  const metadata = await sharp(source).metadata();
  const outputs = [];
  for (const width of [480, 768, metadata.width]) {
    const file = `public/images/hero/${name}-mobile-v1-${width}.webp`;
    const info = await sharp(source).resize({ width }).webp({ quality: 85, effort: 5 }).toFile(file);
    outputs.push({ file, width: info.width, height: info.height, bytes: info.size });
  }
  manifest.push({ source, width: metadata.width, height: metadata.height, outputs });
}
await writeFile('docs/design/hero-mobile-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest.map(({ source, width, height }) => ({ source, width, height }))));
