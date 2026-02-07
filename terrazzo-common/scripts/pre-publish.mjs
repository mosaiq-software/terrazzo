// Prepares the dist folder for workspace consumption
// - copy package.json and README.md to dist

import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// For workspace usage, keep the version as-is
fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

if (fs.existsSync('README.md')) {
    fs.copyFileSync('README.md', 'dist/README.md');
}