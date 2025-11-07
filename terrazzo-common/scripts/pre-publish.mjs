// runs before publishing.
// - copy package.json and README.md to dist
// - remove devDependencies from package.json
// - remove scripts from package.json
// - remove private from package.json

import fs from 'fs';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete packageJson.devDependencies;
delete packageJson.scripts;
delete packageJson.private;
fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

fs.copyFileSync('README.md', 'dist/README.md');