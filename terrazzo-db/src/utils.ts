import dotenv from 'dotenv';
import fs from 'node:fs';

// Best-effort local dev env loading. In Docker, env vars come from compose.
if (fs.existsSync('../.env')) {
    dotenv.config({ path: '../.env' });
}

export const isRunningInDocker = (): boolean => {
    try {
        return fs.existsSync('/.dockerenv');
    } catch {
        return false;
    }
};
