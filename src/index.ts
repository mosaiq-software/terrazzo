import 'dotenv/config'
import { initApp } from './app';
import {initSockets} from './utils/socket';

const start = async () => {
    const url = process.env.API_URL;
    const API_PORT = process.env.API_PORT;
    const SOCKET_PORT = parseInt(process.env.SOCKET_PORT+'') || undefined;
    if (!API_PORT || !url || !SOCKET_PORT) {
        throw new Error('Make sure to set all required environment variables');
    }

    const app = await initApp();
    app.listen(API_PORT, () => {
        console.log(`Server started at ${url}:${API_PORT}`);
    });

    const { io } = initSockets();
    io.listen(SOCKET_PORT);
}

start();