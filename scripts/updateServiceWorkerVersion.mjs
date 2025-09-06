#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to service worker file
const swPath = join(__dirname, '..', 'public', 'sw.js');

// Generate version based on current timestamp
const version = Date.now();

console.log(`🔄 Updating Service Worker cache version to: ${version}`);

try {
  // Read current service worker content
  let swContent = readFileSync(swPath, 'utf8');
  
  // Replace the cache version
  const versionRegex = /const CACHE_VERSION = \d+;/;
  const newVersionLine = `const CACHE_VERSION = ${version};`;
  
  if (versionRegex.test(swContent)) {
    swContent = swContent.replace(versionRegex, newVersionLine);
  } else {
    // If pattern not found, look for the Date.now() pattern and replace it
    const dateNowRegex = /const CACHE_VERSION = Date\.now\(\);/;
    if (dateNowRegex.test(swContent)) {
      swContent = swContent.replace(dateNowRegex, newVersionLine);
    } else {
      console.error('❌ Could not find CACHE_VERSION pattern in service worker');
      process.exit(1);
    }
  }
  
  // Write updated content back
  writeFileSync(swPath, swContent, 'utf8');
  
  console.log('✅ Service Worker cache version updated successfully');
  console.log(`📝 Cache name will be: markdown-editor-pro-v${version}`);
} catch (error) {
  console.error('❌ Failed to update service worker version:', error.message);
  process.exit(1);
}