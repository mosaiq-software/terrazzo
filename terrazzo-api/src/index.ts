import dotenv from 'dotenv';
import { initApp } from './app';
import { initAdminServer } from './socketAdminServer';
import { SocketManager } from './utils/socket/socketManager';
dotenv.config({ path: '../.env' });

const start = async () => {
    const SOCKET_PORT = parseInt(process.env.SOCKET_PORT + '') || undefined;
    if (!SOCKET_PORT) throw new Error('SOCKET_PORT is not defined in environment variables');
    const API_PORT = parseInt(process.env.API_PORT + '') || undefined;
    if (!API_PORT) throw new Error('API_PORT is not defined in environment variables');
    const SOCKET_ADMIN_PORT = parseInt(process.env.SOCKET_ADMIN_PORT + '') || undefined;
    if (!SOCKET_ADMIN_PORT) throw new Error('SOCKET_ADMIN_PORT is not defined in environment variables');
    const API_URL = process.env.API_URL;
    if (!API_URL) throw new Error('API_URL is not defined in environment variables');

    const app = await initApp();
    app.listen(API_PORT, () => {
        console.log(`Server started at ${API_URL} on port ${API_PORT}`);
    });

    const adminServer = await initAdminServer();
    adminServer.listen(SOCKET_ADMIN_PORT, () => {
        console.log(`Socket admin server started at ${API_URL} on port ${SOCKET_ADMIN_PORT}`);
    });

    SocketManager.initialize(SOCKET_PORT);
    console.log(`Socket server started at ${API_URL} on port ${SOCKET_PORT}`);
};

start();
