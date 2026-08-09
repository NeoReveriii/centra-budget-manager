/**
 * Builds favicon PNGs with a consistent padded crop for light and dark themes.
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
  const padding = Math.max(2, Math.round(size * 0.125));
  const artworkSize = size - padding * 2;
  const horizontalOffset = Math.max(1, Math.round(size * 0.03));
  const verticalOffset = Math.max(1, Math.round(size * 0.03));
  const background = name.includes('Dark')
    ? { r: 26, g: 27, b: 32 }
    : { r: 243, g: 241, b: 228 };

  await sharp(input)
    .trim({ threshold: 12 })
    .resize(artworkSize, artworkSize, { fit: 'cover', position: 'centre' })
    .extend({
      top: padding + verticalOffset,
      bottom: padding - verticalOffset,
      left: padding - horizontalOffset,
      right: padding + horizontalOffset,
      background,
    })
    .png()
    .toFile(output);

  console.log(`Wrote ${outName} (${size}x${size})`);
}

await buildFavicon('CentraLogoDefault.png', 'favicon-32.png', 32);
await buildFavicon('CentraLogoDefault.png', 'favicon-48.png', 48);
await buildFavicon('CentraLogoDark.png', 'favicon-dark-32.png', 32);
await buildFavicon('CentraLogoDark.png', 'favicon-dark-48.png', 48);
