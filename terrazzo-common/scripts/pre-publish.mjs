// runs before publishing.
// - copy package.json and README.md to dist
// - remove devDependencies from package.json
// - remove scripts from package.json
// - remove private from package.json

import { execSync } from 'child_process';
import fs from 'fs';
import { exit } from 'process';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

let version = 0;
try {
    const v = execSync('npm view . version', { encoding: 'utf8' }).trim();
    version = parseInt(v.split('.')[0], 10);
} catch (error) {
    console.warn('Error fetching version from npm view:', error.message);
}
if (isNaN(version) || version < 0) {
    console.warn('No version found in npm view, using package.json version');
    const packageJsonVersion = parseInt(packageJson.version.split('.')[0], 10);
    if (!packageJsonVersion || isNaN(packageJsonVersion)) {
        console.error('No version found in package.json, exiting');
        exit(1);
    }
    version = packageJsonVersion;
}
packageJson.version = String(version + 1) + '.0.0';

delete packageJson.devDependencies;
delete packageJson.scripts;
delete packageJson.private;
fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));

if (fs.existsSync('README.md')) {
    fs.copyFileSync('README.md', 'dist/README.md');
}