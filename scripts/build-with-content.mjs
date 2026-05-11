#!/usr/bin/env node
// build-with-content.mjs
//
// Orchestrates the marketing site + content site builds into a single
// deployable directory (frontend/dist).
//
// Order of operations:
//   1. vite build       (in frontend/) → frontend/dist
//   2. astro build      (in content/)  → content/dist
//   3. merge content/dist/* into frontend/dist/, preserving frontend assets
//
// The merge intentionally OVERWRITES any clashing filenames — Astro's
// generated artifacts (sitemap-index.xml, blog/, about.html, llms.txt,
// feed.xml) are the source of truth for those paths.
//
// The marketing site's index.html is NOT clashed (Astro doesn't emit one).

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FRONTEND = resolve(ROOT, 'frontend');
const CONTENT = resolve(ROOT, 'content');
const FRONTEND_DIST = resolve(FRONTEND, 'dist');
const CONTENT_DIST = resolve(CONTENT, 'dist');

function run(cmd, args, cwd) {
  console.log(`\n→ ${cmd} ${args.join(' ')} (cwd: ${cwd})`);
  const res = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: false });
  if (res.status !== 0) {
    console.error(`✗ ${cmd} ${args.join(' ')} failed (exit ${res.status})`);
    process.exit(res.status ?? 1);
  }
}

function buildFrontend() {
  console.log('\n=== [1/3] Building marketing site (Vite) ===');
  run('npx', ['vite', 'build'], FRONTEND);
}

function buildContent() {
  console.log('\n=== [2/3] Building content site (Astro) ===');
  // Ensure content deps are installed (Vercel only installs the root project's deps).
  if (!existsSync(join(CONTENT, 'node_modules'))) {
    run('npm', ['ci', '--prefer-offline', '--no-audit'], CONTENT);
  }
  run('npx', ['astro', 'build'], CONTENT);
}

function mergeOutputs() {
  console.log('\n=== [3/3] Merging content/dist → frontend/dist ===');
  if (!existsSync(CONTENT_DIST)) {
    console.error(`✗ Expected ${CONTENT_DIST} to exist after astro build.`);
    process.exit(1);
  }
  if (!existsSync(FRONTEND_DIST)) {
    console.error(`✗ Expected ${FRONTEND_DIST} to exist after vite build.`);
    process.exit(1);
  }

  // Guard: refuse to overwrite frontend's index.html — that would clobber the SPA.
  const contentIndex = join(CONTENT_DIST, 'index.html');
  if (existsSync(contentIndex)) {
    console.error(
      `✗ content/dist/index.html exists — this would overwrite the SPA homepage.\n` +
        `  Astro must not generate src/pages/index.astro. Aborting merge.`
    );
    process.exit(1);
  }

  cpSync(CONTENT_DIST, FRONTEND_DIST, { recursive: true, force: true });
  console.log(`✓ Merged into ${FRONTEND_DIST}`);

  // Surface what landed at the apex paths we care about.
  const expected = [
    'sitemap-index.xml',
    'robots.txt',
    'llms.txt',
    'llms-full.txt',
    'feed.xml',
    'about.html',
    'blog.html',
  ];
  const missing = expected.filter((p) => !existsSync(join(FRONTEND_DIST, p)));
  if (missing.length > 0) {
    console.warn(
      `⚠ Expected merged files missing: ${missing.join(', ')}\n` +
        `  (this may indicate an Astro routing change — investigate.)`
    );
  }
}

function summarize() {
  const sizes = (dir) =>
    readdirSync(dir).reduce((acc, name) => {
      const full = join(dir, name);
      const s = statSync(full);
      return acc + (s.isDirectory() ? 0 : s.size);
    }, 0);
  const apex = sizes(FRONTEND_DIST);
  console.log(`\n✓ Build complete. Apex files total: ${(apex / 1024).toFixed(1)} KB`);
}

buildFrontend();
buildContent();
mergeOutputs();
summarize();
