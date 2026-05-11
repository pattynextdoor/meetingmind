#!/usr/bin/env node
// render-og-home.mjs
//
// Headlessly renders scripts/og-home-template.html → frontend/public/og-home.png
// using whichever Chromium-class browser is installed locally.
//
// Run after editing the template:
//   npm run og:home
//
// The browser must be installed locally. We probe common install paths in this
// order: Google Chrome, Chromium, Brave, Edge. On Linux/CI we fall back to
// `google-chrome` / `chromium` on PATH.

import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TEMPLATE = resolve(ROOT, 'scripts/og-home-template.html');
const OUTPUT = resolve(ROOT, 'frontend/public/og-home.png');

const CANDIDATES_MAC = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
];
const CANDIDATES_LINUX = [
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

function findBrowser() {
  const list = platform() === 'darwin' ? CANDIDATES_MAC : CANDIDATES_LINUX;
  return list.find(existsSync) ?? null;
}

const browser = findBrowser();
if (!browser) {
  console.error('✗ Could not find a Chromium-class browser to render with.');
  console.error('  Checked:', (platform() === 'darwin' ? CANDIDATES_MAC : CANDIDATES_LINUX).join(', '));
  console.error('  Install Google Chrome or set up Playwright to extend this script.');
  process.exit(1);
}

console.log(`→ Rendering with: ${browser}`);
console.log(`→ Template:       ${TEMPLATE}`);
console.log(`→ Output:         ${OUTPUT}`);

const res = spawnSync(
  browser,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=10000',
    `--screenshot=${OUTPUT}`,
    `file://${TEMPLATE}`,
  ],
  { stdio: 'inherit' }
);

if (res.status !== 0) {
  console.error(`✗ Browser exited with code ${res.status}`);
  process.exit(res.status ?? 1);
}

console.log(`✓ Wrote ${OUTPUT}`);
console.log(`  Confirm by opening it, then test the preview at:`);
console.log(`    https://www.opengraph.xyz/?url=https%3A%2F%2Fmeetingmind.me`);
