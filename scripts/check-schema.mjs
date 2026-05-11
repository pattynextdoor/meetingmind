#!/usr/bin/env node
// check-schema.mjs — extract every JSON-LD block from dist/ and validate it.
//
// Validates:
//   - JSON parses without error
//   - root object has @context (must include schema.org)
//   - root object has @type
//   - if BlogPosting/Article: required fields (headline, author, datePublished, image)
//   - if FAQPage: mainEntity is non-empty array of Question/Answer
//   - if HowTo: step is non-empty array
//   - if Product: offers present
//
// Does NOT round-trip to Google's Rich Results validator (network); we just
// enforce the schema.org core requirements that Google checks for.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
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

const htmlFiles = walk(DIST).filter((f) => f.endsWith('.html'));
const issues = [];
let blockCount = 0;

const required = {
  BlogPosting: ['headline', 'author', 'datePublished', 'image'],
  Article: ['headline', 'author', 'datePublished', 'image'],
  FAQPage: ['mainEntity'],
  HowTo: ['step', 'name'],
  Product: ['name', 'offers'],
  Organization: ['name', 'url'],
  SoftwareApplication: ['name', 'applicationCategory'],
  WebSite: ['name', 'url'],
  Person: ['name'],
  BreadcrumbList: ['itemListElement'],
};

function flag(file, msg) {
  issues.push({ file: relative(DIST, file), msg });
}

function validate(file, data) {
  if (data === null || typeof data !== 'object') {
    flag(file, 'JSON-LD root is not an object');
    return;
  }
  if (Array.isArray(data)) {
    data.forEach((d) => validate(file, d));
    return;
  }
  const ctx = data['@context'];
  if (!ctx || !String(ctx).includes('schema.org')) {
    flag(file, '@context missing or does not reference schema.org');
  }
  const type = data['@type'];
  if (!type) {
    flag(file, '@type missing');
    return;
  }
  const types = Array.isArray(type) ? type : [type];
  for (const t of types) {
    const req = required[t];
    if (!req) continue; // Unknown type — pass through.
    for (const field of req) {
      if (data[field] === undefined || data[field] === null) {
        flag(file, `${t} missing required field "${field}"`);
      }
    }
    if (t === 'FAQPage') {
      if (!Array.isArray(data.mainEntity) || data.mainEntity.length === 0) {
        flag(file, 'FAQPage mainEntity must be a non-empty array');
      } else {
        for (const q of data.mainEntity) {
          if (q['@type'] !== 'Question' || !q.name || !q.acceptedAnswer?.text) {
            flag(file, 'FAQPage contains malformed Question/Answer');
            break;
          }
        }
      }
    }
    if (t === 'HowTo') {
      if (!Array.isArray(data.step) || data.step.length < 2) {
        flag(file, 'HowTo must have at least 2 steps');
      }
    }
    if (t === 'BreadcrumbList') {
      if (!Array.isArray(data.itemListElement) || data.itemListElement.length === 0) {
        flag(file, 'BreadcrumbList itemListElement must be non-empty');
      }
    }
  }
}

const re =
  /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(html))) {
    blockCount++;
    const raw = m[1].trim();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      flag(file, `JSON-LD parse error: ${e.message}`);
      continue;
    }
    validate(file, data);
  }
}

if (issues.length === 0) {
  console.log(`✓ Schema check passed (${blockCount} JSON-LD block(s) across ${htmlFiles.length} pages)`);
  process.exit(0);
}

const byFile = new Map();
for (const i of issues) {
  if (!byFile.has(i.file)) byFile.set(i.file, []);
  byFile.get(i.file).push(i.msg);
}

console.log(`✗ Schema check found ${issues.length} issue(s):\n`);
for (const [file, msgs] of byFile) {
  console.log(`  ${file}`);
  for (const m of msgs) console.log(`    - ${m}`);
}
process.exit(1);
