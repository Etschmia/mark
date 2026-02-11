/**
 * Generate Tauri app icons from the favicon SVG design.
 * Usage: node scripts/generateTauriIcons.mjs
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'src-tauri/icons');

// SVG design (same as favicon.svg but parameterized for any size)
const createSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#06b6d4;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#bgGradient)"/>
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <path d="M ${size * 0.1} ${size * 0.15} L ${size * 0.1} ${size * 0.65} L ${size * 0.2} ${size * 0.65} L ${size * 0.2} ${size * 0.35} L ${size * 0.25} ${size * 0.45} L ${size * 0.3} ${size * 0.35} L ${size * 0.3} ${size * 0.65} L ${size * 0.4} ${size * 0.65} L ${size * 0.4} ${size * 0.15} Z" fill="url(#iconGradient)"/>
    <rect x="${size * 0.45}" y="${size * 0.2}" width="${size * 0.25}" height="${size * 0.35}" rx="${size * 0.02}" fill="url(#iconGradient)" opacity="0.8"/>
    <rect x="${size * 0.48}" y="${size * 0.28}" width="${size * 0.19}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
    <rect x="${size * 0.48}" y="${size * 0.33}" width="${size * 0.15}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
    <rect x="${size * 0.48}" y="${size * 0.38}" width="${size * 0.17}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
    <rect x="${size * 0.48}" y="${size * 0.43}" width="${size * 0.12}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
  </g>
  <rect width="${size}" height="${size * 0.3}" rx="${size * 0.1}" fill="url(#iconGradient)" opacity="0.1"/>
</svg>
`;

const pngSizes = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 512 },
  { name: 'Square30x30Logo.png', size: 30 },
  { name: 'Square44x44Logo.png', size: 44 },
  { name: 'Square71x71Logo.png', size: 71 },
  { name: 'Square89x89Logo.png', size: 89 },
  { name: 'Square107x107Logo.png', size: 107 },
  { name: 'Square142x142Logo.png', size: 142 },
  { name: 'Square150x150Logo.png', size: 150 },
  { name: 'Square284x284Logo.png', size: 284 },
  { name: 'Square310x310Logo.png', size: 310 },
  { name: 'StoreLogo.png', size: 50 },
];

console.log('Generating Tauri icons...');

for (const { name, size } of pngSizes) {
  const svg = Buffer.from(createSVG(size));
  await sharp(svg).png().toFile(resolve(iconsDir, name));
  console.log(`  ${name} (${size}x${size})`);
}

// icon.ico — write 256x256 PNG (Tauri bundler handles conversion on Windows)
const ico = await sharp(Buffer.from(createSVG(256))).png().toBuffer();
writeFileSync(resolve(iconsDir, 'icon.ico'), ico);
console.log('  icon.ico (256x256)');

// icon.icns — write 512x512 PNG (Tauri bundler handles conversion on macOS)
const icns = await sharp(Buffer.from(createSVG(512))).png().toBuffer();
writeFileSync(resolve(iconsDir, 'icon.icns'), icns);
console.log('  icon.icns (512x512)');

console.log('\nDone!');
