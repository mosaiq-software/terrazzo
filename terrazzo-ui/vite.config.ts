import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the
    // `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');
    return {
        define: {
            API_URL: JSON.stringify(env.API_URL || 'http://localhost'),
            SOCKET_URL: JSON.stringify(env.SOCKET_URL || 'http://localhost'),
            FRONTEND_URL: JSON.stringify(env.FRONTEND_URL || 'http://localhost:8080'),
            GITHUB_AUTH_CLIENT_ID: JSON.stringify(env.GITHUB_AUTH_CLIENT_ID || ''),
            GITHUB_AUTH_CALLBACK_URL: JSON.stringify(env.GITHUB_AUTH_CALLBACK_URL || ''),
            NSM_WWW_PATH: JSON.stringify(env.NSM_WWW_PATH || './www'),
            ORG_NAME: JSON.stringify(env.ORG_NAME || 'mosaiq-software'),
        },
        server: {
            port: env.FRONTEND_PORT ? parseInt(env.FRONTEND_PORT) : 8080,
            strictPort: true,
        },
        plugins: [react()],
    };
});
