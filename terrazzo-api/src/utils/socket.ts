import { GithubUserProfile, ServerSE, ServerSocketIOEvent, SocketHandshakeAuth } from '@mosaiq/terrazzo-common';
import { instrument } from '@socket.io/admin-ui';
import { getUserPreview } from '@trz-api/controllers/userController';
import * as socketListeners from '@trz-api/listeners';
import { YSocketIO } from '@trz-api/utils/y-socket-io';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { isDev } from './envUtils';
import { getPrivateGitHubUserData } from './githubUtils';
import { registerEngineSocketEvents } from './socketEngineHandlers';
import { SocketData } from './socketTypes';
import { loginSocket, setSocketData } from './socketUtils';

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
            const auth: SocketHandshakeAuth = socket.handshake.auth as any;
            const userData = await getUserPreview(auth.userId);
            if (!userData) {
                throw new Error('No Terrazzo user found');
            }
            let githubData: GithubUserProfile | null = null;
            if (!(isDev() && userData.githubUserId.startsWith('FAKE_'))) {
                githubData = await getPrivateGitHubUserData(auth.githubToken);
                if (!githubData) {
                    throw new Error('No Github user found');
                }
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

        listenerRegistrars.forEach((register) => register(socket, io));
    });

    io.on(ServerSocketIOEvent.CONNECTION_ERROR, (err) => {
        console.error('Connection error', err.code, err.req);
    });

    return { io };
};

export { initSockets };
