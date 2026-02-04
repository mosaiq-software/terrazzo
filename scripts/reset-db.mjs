#!/usr/bin/env node
import dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

const volumePath = process.env.VOLUME_PATH;
if (!volumePath || volumePath.trim().length === 0) {
    console.error('❌ VOLUME_PATH is not defined in the environment variables.');
    process.exit(1);
}
const dbPath = resolve(process.cwd(), `${volumePath}/db/terrazzo.sqlite`);

console.log('🗑️  Resetting database...');
console.log(`Database path: ${dbPath}`);

// Delete the database file if it exists
if (existsSync(dbPath)) {
    try {
        unlinkSync(dbPath);
        console.log('✅ Database file deleted');
    } catch (error) {
        console.error('❌ Failed to delete database:', error.message);
        process.exit(1);
    }
} else {
    console.log('ℹ️  No database file found');
}

// Run migrations to recreate the database
console.log('\n📦 Running migrations...');
try {
    execSync('npm run migrate:db', { stdio: 'inherit', cwd: process.cwd() });
    console.log('\n✅ Database reset complete!');
} catch (error) {
    console.error('\n❌ Failed to run migrations:', error.message);
    process.exit(1);
}
