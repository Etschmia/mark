#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Generate build information
const buildInfo = {
  buildDate: new Date().toISOString(),
  buildTimestamp: Date.now(),
  version: process.env.npm_package_version || '0.0.0'
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