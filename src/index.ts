import 'dotenv/config'
import { initApp } from './app';
import {initSockets} from './socket';

const start = async () => {
    const url = process.env.API_URL;
    const API_PORT = process.env.API_PORT;
    const LOW_BAND_SOCKET_PORT = process.env.LOW_BAND_SOCKET_PORT;
    const HIGH_BAND_SOCKET_PORT = process.env.HIGH_BAND_SOCKET_PORT;
    if (!API_PORT || !url || !LOW_BAND_SOCKET_PORT || !HIGH_BAND_SOCKET_PORT) {
        throw new Error('Make sure to set all required environment variables');
    }

    const app = await initApp();
    app.listen(API_PORT, () => {
        console.log(`Server started at ${url}:${API_PORT}`);
    });

    const { lowBandServer, highBandServer } = initSockets();
    lowBandServer.listen(LOW_BAND_SOCKET_PORT, () => {
        console.log('Low Band Socket Server started at port ', LOW_BAND_SOCKET_PORT);
    });
    highBandServer.listen(HIGH_BAND_SOCKET_PORT, () => {
        console.log('High Band Socket Server started at port ', HIGH_BAND_SOCKET_PORT);
    });
}

start();