#!/usr/bin/env node
// check-llms.mjs — validate llms.txt against the spec and check link health.
//
// Spec: https://llmstxt.org
//
// Validations:
//   - First non-empty line starts with "# " (H1 title)
//   - Second non-empty content is a blockquote "> ..." description
//   - At least one "## " section heading
//   - All link targets in the file return 200 (or are local file paths in dist)
//
// Mode:
//   By default, only local links (under our site URL) are checked, by
//   resolving them to the dist/ output. Pass --network to also HEAD external
//   URLs (slower, requires internet, used in CI for full coverage).

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'frontend', 'dist');
const SITE_BASE = 'https://meetingmind.me';
const NETWORK = process.argv.includes('--network');

const path = join(DIST, 'llms.txt');
if (!existsSync(path)) {
  console.error(`✗ ${path} not found. Run \`npm run build\` first.`);
  process.exit(2);
}

const text = readFileSync(path, 'utf8');
const lines = text.split(/\r?\n/);
const issues = [];

const nonEmpty = lines.filter((l) => l.trim().length > 0);
if (nonEmpty.length === 0) {
  issues.push('llms.txt is empty');
}

if (nonEmpty[0] && !nonEmpty[0].startsWith('# ')) {
  issues.push('first non-empty line must be an H1 ("# Title")');
}

const hasBlockquote = nonEmpty.slice(1, 4).some((l) => l.startsWith('> '));
if (!hasBlockquote) {
  issues.push('expected a blockquote "> short description" near the top');
}

const sections = lines.filter((l) => l.startsWith('## '));
if (sections.length === 0) {
  issues.push('no "## Section" headings found');
}

// Extract markdown links: [text](url)
const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
const links = [];
let m;
while ((m = linkRe.exec(text))) {
  links.push({ text: m[1], url: m[2] });
}

function resolveLocal(url) {
  if (!url.startsWith(SITE_BASE)) return null;
  const rel = url.slice(SITE_BASE.length).split('#')[0].split('?')[0];
  if (rel === '' || rel === '/') return join(DIST, 'index.html');
  const candidate = join(DIST, rel.replace(/^\//, ''));
  if (existsSync(candidate)) return candidate;
  if (existsSync(candidate + '.html')) return candidate + '.html';
  if (existsSync(join(candidate, 'index.html'))) return join(candidate, 'index.html');
  return false; // local URL but no matching file
}

async function checkExternal(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (res.ok) return true;
    // Some servers reject HEAD; try GET.
    if (res.status === 405 || res.status === 501) {
      const r2 = await fetch(url, { method: 'GET', redirect: 'follow' });
      return r2.ok;
    }
    return false;
  } catch {
    return false;
  }
}

let checked = 0;
let broken = [];

for (const { url } of links) {
  const local = resolveLocal(url);
  if (local === null) {
    if (NETWORK) {
      const ok = await checkExternal(url);
      checked++;
      if (!ok) broken.push(url);
    }
    continue;
  }
  checked++;
  if (local === false) broken.push(url);
}

for (const url of broken) {
  issues.push(`link not reachable: ${url}`);
}

if (issues.length === 0) {
  console.log(
    `✓ llms.txt check passed (${links.length} links, ${checked} verified${NETWORK ? '' : ' — local only; pass --network for external'})`
  );
  process.exit(0);
}

console.log(`✗ llms.txt check found ${issues.length} issue(s):`);
for (const i of issues) console.log(`  - ${i}`);
process.exit(1);
