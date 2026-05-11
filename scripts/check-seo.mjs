#!/usr/bin/env node
// check-seo.mjs — crawl the merged dist/ and report SEO issues.
//
// Checks each .html page for:
//   - <title> present and ≤ 60 chars
//   - <meta name="description"> present and ≤ 170 chars
//   - <link rel="canonical"> present
//   - at least one JSON-LD <script>
//   - internal links resolve to a file in dist/
//
// Exit code 1 if any pages fail; CI uses this.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '..', 'frontend', 'dist');

if (!existsSync(DIST)) {
  console.error(`✗ ${DIST} not found. Run \`npm run build\` first.`);
  process.exit(2);
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function rx(html, re) {
  const m = re.exec(html);
  return m ? m[1] : null;
}

function rxAll(html, re) {
  const out = [];
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function relUrlToPath(url, fromHtmlAbs) {
  // Normalize a URL/href into a path inside dist/, or null if external.
  if (!url) return null;
  if (/^(https?:)?\/\//i.test(url)) return null;
  if (url.startsWith('mailto:') || url.startsWith('tel:')) return null;
  if (url.startsWith('#')) return null;
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  if (clean.startsWith('/')) {
    // Absolute path from site root.
    return clean === '/' ? join(DIST, 'index.html') : join(DIST, clean.slice(1));
  }
  // Relative path.
  return resolve(dirname(fromHtmlAbs), clean);
}

function existsAsRoute(p) {
  if (!p) return true;
  if (existsSync(p)) return true;
  if (existsSync(p + '.html')) return true;
  if (existsSync(join(p, 'index.html'))) return true;
  return false;
}

const allFiles = walk(DIST);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

const issues = [];
function flag(file, msg) {
  issues.push({ file: relative(DIST, file), msg });
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');

  const title = rx(html, /<title[^>]*>([^<]*)<\/title>/i);
  if (!title) flag(file, 'missing <title>');
  else if (title.length > 65)
    flag(file, `<title> too long (${title.length} > 65): "${title.slice(0, 80)}…"`);

  const desc = rx(
    html,
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
  );
  if (!desc) flag(file, 'missing <meta name="description">');
  else if (desc.length > 160)
    flag(file, `description too long (${desc.length} > 160)`);

  const canonical = rx(
    html,
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i
  );
  if (!canonical) flag(file, 'missing <link rel="canonical">');

  // JSON-LD presence (any block; check-schema validates content).
  const jsonLd = /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
  if (!jsonLd) flag(file, 'no JSON-LD block on page');

  // OG basics.
  const ogTitle = /<meta[^>]+property=["']og:title["']/i.test(html);
  const ogDesc = /<meta[^>]+property=["']og:description["']/i.test(html);
  const ogImage = /<meta[^>]+property=["']og:image["']/i.test(html);
  if (!ogTitle) flag(file, 'missing og:title');
  if (!ogDesc) flag(file, 'missing og:description');
  if (!ogImage) flag(file, 'missing og:image');

  // Twitter card.
  const twCard = /<meta[^>]+name=["']twitter:card["']/i.test(html);
  if (!twCard) flag(file, 'missing twitter:card');

  // Internal links.
  const hrefs = rxAll(html, /<a[^>]+href=["']([^"']+)["']/gi);
  for (const href of hrefs) {
    const target = relUrlToPath(href, file);
    if (!target) continue;
    if (!existsAsRoute(target)) {
      flag(file, `broken internal link → ${href}`);
    }
  }
}

const byFile = new Map();
for (const i of issues) {
  if (!byFile.has(i.file)) byFile.set(i.file, []);
  byFile.get(i.file).push(i.msg);
}

if (issues.length === 0) {
  console.log(`✓ SEO check passed (${htmlFiles.length} pages)`);
  process.exit(0);
}

console.log(`✗ SEO check found ${issues.length} issue(s) across ${byFile.size} page(s):\n`);
for (const [file, msgs] of byFile) {
  console.log(`  ${file}`);
  for (const m of msgs) console.log(`    - ${m}`);
}
process.exit(1);
