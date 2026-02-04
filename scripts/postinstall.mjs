import { existsSync } from 'fs';
import { execSync } from 'child_process';

/**
 * Cross-platform postinstall script that builds terrazzo-common and terrazzo-db if they exist.
 * This replaces the shell-specific postinstall script to ensure Windows compatibility.
 */

function buildIfExists(dir, command) {
  if (existsSync(dir)) {
    console.log(`Building ${dir}...`);
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Failed to build ${dir}:`, error.message);
      // Continue execution even if build fails
    }
  }
}

buildIfExists('terrazzo-common', 'npm run build:common:once');
buildIfExists('terrazzo-db', 'npm run build:db:once');
