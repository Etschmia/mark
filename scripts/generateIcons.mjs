#!/usr/bin/env node

// Icon generator for Markdown Editor Pro PWA
// This script generates all required PWA icons from a base SVG design

import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Base SVG design for Markdown Editor Pro
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
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.1}" fill="url(#bgGradient)"/>
  
  <!-- Main icon area -->
  <g transform="translate(${size * 0.15}, ${size * 0.15})">
    <!-- Markdown "M" symbol -->
    <path d="M ${size * 0.1} ${size * 0.15} L ${size * 0.1} ${size * 0.65} L ${size * 0.2} ${size * 0.65} L ${size * 0.2} ${size * 0.35} L ${size * 0.25} ${size * 0.45} L ${size * 0.3} ${size * 0.35} L ${size * 0.3} ${size * 0.65} L ${size * 0.4} ${size * 0.65} L ${size * 0.4} ${size * 0.15} Z" fill="url(#iconGradient)"/>
    
    <!-- Document representation -->
    <rect x="${size * 0.45}" y="${size * 0.2}" width="${size * 0.25}" height="${size * 0.35}" rx="${size * 0.02}" fill="url(#iconGradient)" opacity="0.8"/>
    
    <!-- Text lines -->
    <rect x="${size * 0.48}" y="${size * 0.28}" width="${size * 0.19}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
    <rect x="${size * 0.48}" y="${size * 0.33}" width="${size * 0.15}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
    <rect x="${size * 0.48}" y="${size * 0.38}" width="${size * 0.17}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
    <rect x="${size * 0.48}" y="${size * 0.43}" width="${size * 0.12}" height="${size * 0.02}" rx="${size * 0.01}" fill="white" opacity="0.7"/>
  </g>
  
  <!-- Subtle highlight -->
  <rect width="${size}" height="${size * 0.3}" rx="${size * 0.1}" fill="url(#iconGradient)" opacity="0.1"/>
</svg>
`;

// Shortcut icons
const createShortcutSVG = (type, size) => {
  const icons = {
    new: `
      <path d="M12 5v14m-7-7h14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `,
    help: `
      <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="17" r="1" fill="white"/>
    `
  };

  return `
<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="24" height="24" rx="4" fill="url(#bgGradient)"/>
  ${icons[type]}
</svg>
  `;
};

async function generateIcons() {
  const iconsDir = './public/icons';
  
  try {
    await mkdir(iconsDir, { recursive: true });
    console.log('📁 Icons directory created');

    // Generate main app icons
    for (const size of sizes) {
      const svg = createSVG(size);
      const filename = `${iconsDir}/icon-${size}x${size}.png`;
      
      // For this demo, we'll save as SVG (would need additional tooling for PNG conversion)
      const svgFilename = `${iconsDir}/icon-${size}x${size}.svg`;
      const writeStream = createWriteStream(svgFilename);
      writeStream.write(svg);
      writeStream.end();
      
      console.log(`✅ Generated ${svgFilename}`);
    }

    // Generate shortcut icons
    const shortcutSVG_new = createShortcutSVG('new', 96);
    const shortcutSVG_help = createShortcutSVG('help', 96);
    
    const newStream = createWriteStream(`${iconsDir}/shortcut-new.svg`);
    newStream.write(shortcutSVG_new);
    newStream.end();
    
    const helpStream = createWriteStream(`${iconsDir}/shortcut-help.svg`);
    helpStream.write(shortcutSVG_help);
    helpStream.end();
    
    console.log('✅ Generated shortcut icons');
    
    // Generate favicon
    const faviconSVG = createSVG(32);
    const faviconStream = createWriteStream('./public/favicon.svg');
    faviconStream.write(faviconSVG);
    faviconStream.end();
    
    console.log('✅ Generated favicon.svg');
    
    console.log('\n🎉 All PWA icons generated successfully!');
    console.log('\n📝 Note: SVG files generated. For production, convert to PNG using:');
    console.log('   - Online tools like https://convertio.co/svg-png/');
    console.log('   - Command line tools like ImageMagick or Inkscape');
    console.log('   - Build tools like Sharp or Canvas');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
  }
}

// Run if this file is executed directly
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  generateIcons();
}

export { generateIcons };