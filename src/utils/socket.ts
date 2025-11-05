import { Server } from 'socket.io';
import { ServerSE, ServerSocketIOEvent, SocketHandshakeAuth } from '@mosaiq/terrazzo-common/socketTypes';
import { registerCustomSocketEvents } from './socketCustomHandlers';
import { registerEngineSocketEvents } from './socketEngineHandlers';
import { SocketData } from './socketTypes';
import { loginSocket, setSocketData } from './socketUtils';
import { instrument } from '@socket.io/admin-ui';
import { getPrivateGitHubUserData } from './githubUtils';
import { getUserPreview } from '@trz-api/controllers/userController';
import { createServer } from 'http';
import { Document, YSocketIO } from '@trz-api/utils/y-socket-io';
import * as Y from 'yjs';

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
            const auth: SocketHandshakeAuth = socket.handshake.auth as any;
            const githubData = await getPrivateGitHubUserData(auth.githubToken);
            const userData = await getUserPreview(auth.userId);

            if (!githubData || !userData) {
                throw new Error('No user found');
            }

            const socketData: SocketData = {
                connectedAt: new Date(),
                githubAccessToken: auth.githubToken,
                user: {
                    sid: socket.id,
                    idle: false,
                    user: userData,
                },
            };
            setSocketData(socket, socketData);
            loginSocket(socket, userData.id);
        } catch (error) {
            console.warn('Error connecting ' + socket.id, error);
            socket.disconnect(true);
            return;
        }

        socket.emit(ServerSE.READY);

        registerEngineSocketEvents(socket, io);
        registerCustomSocketEvents(socket, io);
    });

    io.on(ServerSocketIOEvent.CONNECTION_ERROR, (err) => {
        console.error('Connection error', err.code, err.req);
    });

    return { io };
};

export { initSockets };
