import 'dotenv/config'
import { initApp } from './app';
import {initSockets} from './utils/socket';
import { initAdminServer } from './socketAdminServer';

const start = async () => {
    const SOCKET_PORT = parseInt(process.env.SOCKET_PORT+'') || undefined;
    if (
        !SOCKET_PORT ||
        !process.env.API_PORT ||
        !process.env.API_URL ||
        !process.env.GITHUB_AUTH_CLIENT_SECRET ||
        !process.env.GITHUB_AUTH_CALLBACK_URL ||
        !process.env.GITHUB_AUTH_CLIENT_ID ||
        !process.env.ORG_NAME ||
        !process.env.DATABASE_PATH ||
        !process.env.DATABASE_LOGGING ||
        !process.env.FRONTEND_URL
    ) {
        throw new Error('Make sure to set all required environment variables');
    }

    const app = await initApp();
    app.listen(process.env.API_PORT, () => {
        console.log(`Server started at ${process.env.API_URL}:${process.env.API_PORT}`);
    });

    const adminServer = await initAdminServer();
    adminServer.listen(process.env.SOCKET_ADMIN_PORT, () => {
        console.log(`Socket admin server started at ${process.env.API_URL}:${process.env.SOCKET_ADMIN_PORT}`);
    });

    const { io } = initSockets();
    io.listen(SOCKET_PORT);
}

start();