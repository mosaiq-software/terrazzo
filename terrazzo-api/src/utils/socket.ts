import { ServerSE, ServerSocketIOEvent } from '@mosaiq/terrazzo-common';
import { instrument } from '@socket.io/admin-ui';
import * as socketListeners from '@trz-api/listeners';
import { YSocketIO } from '@trz-api/utils/y-socket-io';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { registerEngineSocketEvents } from './socketEngineHandlers';
import { initializeSocketData, loginSocket, setSocketData } from './socketUtils';

const listenerRegistrars = [registerEngineSocketEvents, ...Object.values(socketListeners)];

const initSockets = () => {
    console.info('Starting sockets');
    const httpServer = createServer();
    const io = new Server(httpServer, {
        cors: {
            origin: [process.env.FRONTEND_URL + '', `https://api.terrazzo.mosaiq.dev/socketadmin`],
            credentials: true,
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 1 * 60 * 1000, // 1 minutes
            skipMiddlewares: true,
        },
        path: '/socket',
    });

    instrument(io, {
        auth: false,
        mode: 'production',
    });

    const ysocketio = new YSocketIO(io, {});
    ysocketio.initialize();

    io.on(ServerSocketIOEvent.CONNECTION, async (socket) => {
        try {
            const socketData = await initializeSocketData(socket);
            setSocketData(socket, socketData);
            if (socketData.user) {
                loginSocket(socket, socketData.user.userId);
            }
        } catch (error) {
            console.warn('Error connecting ' + socket.id, error);
            socket.disconnect(true);
            return;
        }

        socket.emit(ServerSE.READY);

        listenerRegistrars.forEach((register) => register(socket, io));
    });

    io.on(ServerSocketIOEvent.CONNECTION_ERROR, (err) => {
        console.error('Connection error', err.code, err.req);
    });

    return { io };
};

export { initSockets };
