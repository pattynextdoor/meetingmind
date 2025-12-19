import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// Get version from package.json
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const newVersion = packageJson.version;

console.log(`Bumping version to ${newVersion}...`);

// Update manifest.json
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
manifest.version = newVersion;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`✓ Updated manifest.json to version ${newVersion}`);

// Update versions.json
const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
if (!versions[newVersion]) {
  versions[newVersion] = manifest.minAppVersion;
  writeFileSync('versions.json', JSON.stringify(versions, null, 2) + '\n');
  console.log(`✓ Added version ${newVersion} to versions.json (minAppVersion: ${manifest.minAppVersion})`);
} else {
  console.log(`✓ Version ${newVersion} already exists in versions.json`);
}

console.log(`\nVersion bump complete!`);
console.log(`Next steps:`);
console.log(`1. Build: npm run build`);
console.log(`2. Commit: git commit -m "Bump version to ${newVersion}"`);
console.log(`3. Tag: git tag v${newVersion}`);
console.log(`4. Push: git push origin main --tags`);
console.log(`5. Create GitHub release with main.js, manifest.json, styles.css`);

