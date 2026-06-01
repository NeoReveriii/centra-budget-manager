/**
 * Builds tight favicon PNGs from Centra logo marks (trim + scale up in frame).
 * Run: node scripts/generate-favicons.mjs
 */
import sharp from 'sharp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const imagesDir = join(publicDir, 'assets', 'images');

async function buildFavicon(name, outName, size) {
  const input = join(imagesDir, name);
  const output = join(publicDir, outName);

  await sharp(input)
    .trim({ threshold: 12 })
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(output);

  console.log(`Wrote ${outName} (${size}x${size})`);
}

await buildFavicon('CentraLogoDefault.png', 'favicon-32.png', 32);
await buildFavicon('CentraLogoDefault.png', 'favicon-48.png', 48);
await buildFavicon('CentraLogoDark.png', 'favicon-dark-32.png', 32);
