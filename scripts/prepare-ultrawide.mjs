import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const names = ['mov-ciclista-orla', 'mov-scooter-cidade', 'mov-mobilidade-orla'];
const manifest = [];
await mkdir('public/images/hero', { recursive: true });
for (const name of names) {
  const source = `assets/source/hero-ultrawide/${name}-ultrawide-v1.png`;
  const metadata = await sharp(source).metadata();
  const outputs = [];
  for (const width of [1280, 1920, metadata.width]) {
    const file = `public/images/hero/${name}-ultrawide-v1-${width}.webp`;
    const { data, info } = await sharp(source).resize({ width }).webp({ quality: 85, effort: 5 }).toBuffer({ resolveWithObject: true });
    await writeFile(file, data);
    outputs.push({ file, width: info.width, height: info.height, bytes: info.size });
  }
  manifest.push({ source, nativeWidth: metadata.width, nativeHeight: metadata.height, outputs });
}
await writeFile('docs/design/hero-ultrawide-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
const ctaSource = 'assets/source/newsletter-ultrawide/mov-encontro-orla-ultrawide-v1.png';
const ctaMetadata = await sharp(ctaSource).metadata();
const ctaOutputs = [];
for (const width of [1280, 1920, ctaMetadata.width]) {
  const file = `public/images/newsletter/mov-encontro-orla-ultrawide-v1-${width}.webp`;
  const { data, info } = await sharp(ctaSource).resize({ width }).webp({ quality: 85, effort: 5 }).toBuffer({ resolveWithObject: true });
  await writeFile(file, data);
  ctaOutputs.push({ file, width: info.width, height: info.height, bytes: info.size });
}
await writeFile('docs/design/newsletter-ultrawide-manifest.json', JSON.stringify({ source: ctaSource, nativeWidth: ctaMetadata.width, nativeHeight: ctaMetadata.height, outputs: ctaOutputs }, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
