import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
dotenv.config({ path: '../.env' });

export default defineConfig(({ mode }) => {
    return {
        envDir: '../',
        define: {
            'import.meta.env.API_URL': JSON.stringify(process.env.API_URL),
            'import.meta.env.SOCKET_URL': JSON.stringify(process.env.SOCKET_URL),
            'import.meta.env.FRONTEND_URL': JSON.stringify(process.env.FRONTEND_URL),
            'import.meta.env.GITHUB_AUTH_CLIENT_ID': JSON.stringify(process.env.GITHUB_AUTH_CLIENT_ID),
            'import.meta.env.GITHUB_AUTH_CALLBACK_URL': JSON.stringify(process.env.GITHUB_AUTH_CALLBACK_URL),
            'import.meta.env.NSM_WWW_PATH': JSON.stringify(process.env.NSM_WWW_PATH),
            'import.meta.env.ORG_NAME': JSON.stringify(process.env.ORG_NAME),
        },
        server: {
            port: 8080,
            strictPort: true,
        },
        plugins: [
            react(),
            svgr({
                svgrOptions: {
                    // svgr options
                },
            }),
        ],
        resolve: {
            alias: {
                '@trz': path.resolve(__dirname, './src'),
            },
        },
    };
});
