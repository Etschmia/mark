#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Read package.json to get versions
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Generate build information
const buildInfo = {
  buildDate: new Date().toISOString(),
  buildTimestamp: Date.now(),
  version: packageJson.version || '1.0.0',
  viteVersion: packageJson.dependencies?.vite?.replace('^', '') || packageJson.devDependencies?.vite?.replace('^', '') || 'Unknown'
};

// Write to public directory so it's accessible at runtime
const buildInfoPath = path.join(process.cwd(), 'public', 'build-info.json');

try {
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log('✅ Build info generated:', buildInfoPath);
  console.log('📅 Build date:', buildInfo.buildDate);
} catch (error) {
  console.error('❌ Failed to generate build info:', error);
  process.exit(1);
}