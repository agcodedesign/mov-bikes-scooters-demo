import { readdir, mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = process.argv[2] || 'D:/AG-DESIGN/AG_OPERACOES/01_CLIENTES/BIKECELL/ASSETS';
const entries = await readdir(source);
const mappings = [
  ['LOGO-fundoclaro.webp', 'brand/mov-logo-fundo-claro', [], 'Header'],
  ['LOGO.webp', 'brand/mov-logo-fundo-escuro', [], 'Reserva para superfícies escuras'],
  ['logofixa.webp', 'brand/mov-logo-simbolo', [], 'Footer'],
  ['logoag.webp', 'brand/ag-code-design', [176, 264], 'Crédito discreto AG no rodapé'],
  ['hero 1.jpg', 'hero/mov-ciclista-orla', [768, 1280, 1920], 'Hero tablet'],
  ['hero 2.jpg', 'hero/mov-scooter-cidade', [768, 1280, 1920], 'Reserva fornecida'],
  ['hero 3.jpg', 'hero/mov-mobilidade-orla', [768, 1280, 1920, 2560], 'Hero desktop e mobile'],
  ['footer.jpg', 'newsletter/mov-encontro-orla', [768, 1280, 1920], 'Newsletter'],
  ['bikeeletrica.jpg', 'lifestyle/mov-bicicleta-parque', [640, 960, 1280], 'Experiência'],
  ['scootereletrica.jpg', 'lifestyle/mov-scooter-orla', [640, 960, 1280], 'Reserva fornecida'],
  ['closed.jpg', 'products/mov-bicicleta-detalhe-traseiro', [640, 960, 1280], 'Catálogo apoio'],
  ['top.jpg', 'products/mov-bicicleta-vista-superior', [640, 960, 1280], 'Catálogo e experiência'],
  ['v8front.jpg', 'products/mov-v8-pro-s-frontal', [640, 960, 1280, 1920], 'Destaque, citação e abertura de produto em tela inteira'],
  ['scoterfront.jpg', 'products/mov-scooter-frontal', [640, 960, 1280], 'Reserva fornecida'],
  ['SY_N7_electric_scooter_displayed_b86aead6.jpg', 'products/mov-scooter-vista-geral', [640, 960, 1280], 'Marca'],
  ['SY_N7_electric_scooter_rear_00f80897.jpg', 'products/mov-scooter-detalhe-traseiro', [640, 960, 1280], 'Reserva fornecida'],
  [entries.find(name => name.startsWith('Photographic_reconstruction')), 'editorial/mov-scooter-orla-anoitecer', [640, 960, 1280], 'Editorial'],
];
const manifest = [];
for (const [original, name, widths, role] of mappings) {
  if (!original) throw new Error(`Missing original for ${name}`);
  const input = path.join(source, original);
  const metadata = await sharp(input).metadata();
  const base = path.join('public/images', name);
  await mkdir(path.dirname(base), { recursive: true });
  const outputs = [];
  if (!widths.length) {
    await copyFile(input, `${base}.webp`);
    outputs.push({ file: `/images/${name}.webp`, width: metadata.width, height: metadata.height });
  } else {
    for (const width of widths) {
      const { data, info } = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 83, effort: 5 }).toBuffer({ resolveWithObject: true });
      await writeFile(`${base}-${width}.webp`, data);
      outputs.push({ file: `/images/${name}-${width}.webp`, width: info.width, height: info.height, bytes: info.size });
    }
  }
  manifest.push({ source: original, role, name, originalWidth: metadata.width, originalHeight: metadata.height, outputs });
}
await mkdir('docs/design', { recursive: true });
await writeFile('docs/assets-manifest.json', JSON.stringify({ source, generatedAt: new Date().toISOString(), assets: manifest }, null, 2) + '\n');
console.log(`Prepared ${manifest.length} originals, ${manifest.flatMap(item => item.outputs).length} WebP files.`);
