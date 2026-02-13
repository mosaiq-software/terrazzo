#!/usr/bin/env node
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Recursively removes all node_modules and dist folders in the project.
 * This resets the project to a clean state similar to right after cloning.
 */

const rootDir = process.cwd();
const foldersToRemove = ['node_modules', 'dist'];

console.log('🧹 Cleaning project...\n');

/**
 * Recursively find and remove specified folders
 */
function cleanDirectory(dir, depth = 0) {
    if (!existsSync(dir)) {
        return;
    }

    try {
        const items = readdirSync(dir);

        for (const item of items) {
            const itemPath = join(dir, item);

            // Skip if not accessible
            try {
                const stat = statSync(itemPath);

                if (stat.isDirectory()) {
                    // If this is a folder we want to remove, delete it
                    if (foldersToRemove.includes(item)) {
                        console.log(`  ${'  '.repeat(depth)}🗑️  Removing ${itemPath.replace(rootDir, '.')}`);
                        rmSync(itemPath, { recursive: true, force: true });
                    } else {
                        // Otherwise, recurse into it
                        cleanDirectory(itemPath, depth + 1);
                    }
                }
            } catch (error) {
                // Skip inaccessible items
                continue;
            }
        }
    } catch (error) {
        console.error(`⚠️  Could not access directory ${dir}:`, error.message);
    }
}

// Clean the entire project
cleanDirectory(rootDir);

console.log('\n✅ Project cleaned successfully!');
console.log('💡 Run "npm install" to restore dependencies.');
