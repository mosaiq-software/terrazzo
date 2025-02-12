import { Server } from 'socket.io';
import { ServerSE, ServerSocketIOEvent } from '@mosaiq/terrazzo-common/socketTypes';
import { validateGithubAuthToken } from './authUtils';
import { registerCustomSocketEvents } from './socketCustomHandlers';
import { registerEngineSocketEvents } from './socketEngineHandlers';
import { SocketData } from './socketTypes';

const initSockets = () => {
    console.info("Starting sockets");

    const io = new Server({
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 1 * 60 * 1000, // 1 minutes
            skipMiddlewares: true,
        },
    });

    io.on(ServerSocketIOEvent.CONNECTION, async (socket) => {
        try {
            const token = socket.handshake.auth.token;
            const userData = await validateGithubAuthToken(token);
            const socketData: SocketData = {
                connectedAt: new Date(),
                access_token: token,
                user: {
                    sid: socket.id,
                    githubId: userData.id,
                    username: userData.login,
                    avatarUrl: userData.avatar_url,
                    fullName: userData.name,
                    idle: false,
                }
            };
            (socket.data as SocketData) = socketData;
        } catch (error) {
            console.error('Error validating token:', error);
            socket.disconnect(true);
        }


        socket.emit(ServerSE.READY);

        registerEngineSocketEvents(socket, io);
        registerCustomSocketEvents(socket, io);
    });

    return { io };
}

export { initSockets };