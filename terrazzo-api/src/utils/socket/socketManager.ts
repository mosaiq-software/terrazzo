import { ServerSE, ServerSocketIOEvent, UserId } from '@mosaiq/terrazzo-common';
import * as socketListeners from '@trz-api/listeners';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { YSocketIO } from '../y-socket-io';
import { registerEngineSocketEvents } from './socketEngineHandlers';
import { initializeSocketData, loginSocket, setSocketData } from './socketUtils';

const listenerRegistrars = [registerEngineSocketEvents, ...Object.values(socketListeners)];

/**
 * Singleton to hold socket.io server and YSocketIO instance
 */
export class SocketManager {
    private static instance: SocketManager;
    public io: Server;
    public yio: YSocketIO;

    private constructor(io: Server, yio: YSocketIO) {
        this.io = io;
        this.yio = yio;
    }

    public static initialize(socketPort: number): SocketManager {
        if (SocketManager.instance) {
            return SocketManager.instance;
        }

        console.info('Starting sockets');

        const httpServer = createServer();
        const ioEngine = new Server(httpServer, {
            cors: {
                origin: [String(process.env.FRONTEND_URL)],
                credentials: true,
            },
            connectionStateRecovery: {
                maxDisconnectionDuration: 1 * 60 * 1000, // 1 minutes
                skipMiddlewares: true,
            },
            path: '/socket',
        });

        const yioEngine = new YSocketIO(ioEngine);
        yioEngine.initialize();

        ioEngine.on(ServerSocketIOEvent.CONNECTION, async (socket) => {
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

            listenerRegistrars.forEach((register) => register(socket));
        });

        ioEngine.on(ServerSocketIOEvent.CONNECTION_ERROR, (err) => {
            console.error('Connection error', err.code, err.req);
        });

        ioEngine.listen(socketPort);

        SocketManager.instance = new SocketManager(ioEngine, yioEngine);

        return SocketManager.instance;
    }

    /**
     * Get the singleton SocketManager instance
     */
    public static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            throw new Error('SocketManager is not initialized');
        }
        return SocketManager.instance;
    }

    /**
     * Syncs any socket data that may have updated since the socket was initialized for the given user
     *
     * This should be called whenever:
     * - User roles are updated (sync users's permissions to edit text blocks)
     * - A role the user has its permissions updated (sync user's permissions to edit text blocks)
     */
    public static async syncUserSocketDataForUser(userId: UserId): Promise<void> {
        await this.getInstance().yio.syncSocketEditStatusForUser(userId);
    }
}
