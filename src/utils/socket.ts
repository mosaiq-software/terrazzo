import { Server } from 'socket.io';
import { ServerSE, ServerSocketIOEvent, SocketHandshakeAuth } from '@mosaiq/terrazzo-common/socketTypes';
import { registerCustomSocketEvents } from './socketCustomHandlers';
import { registerEngineSocketEvents } from './socketEngineHandlers';
import { SocketData } from './socketTypes';
import { loginSocket, setSocketData } from './socketUtils';
import { instrument } from "@socket.io/admin-ui";
import { getPrivateGitHubUserData } from './githubUtils';
import { getUserPreview } from '@trz-api/controllers/userController';
import { createServer } from 'http';
import { Document, YSocketIO } from '@trz-api/utils/y-socket-io';
import * as Y from 'yjs';

const initSockets = () => {
    console.info("Starting sockets");
    const httpServer = createServer();
    const io = new Server(httpServer, {
        cors: {
            origin: [process.env.FRONTEND_URL+"", `https://api.terrazzo.mosaiq.dev/socketadmin`],
            credentials: true
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 1 * 60 * 1000, // 1 minutes
            skipMiddlewares: true,
        },
        path: "/socket"
    });

    instrument(io, {
        auth: false,
        mode: "production",
    });

    // Create the YSocketIO instance
    // NOTE: This uses the socket namespaces that match the regular expression /^\/yjs\|.*$/, make sure that when using namespaces
    //       for other logic, these do not match the regular expression, this could cause unwanted problems.
    // TIP: You can export a new instance from another file to manage as singleton and access documents from all app.
    const ysocketio = new YSocketIO(io, {
    // authenticate: (auth) => auth.token === 'valid-token',
    // levelPersistenceDir: './storage-location',
    // gcEnabled: true,
    })

    // ysocketio.on('document-update', (doc: Document, update: Uint8Array) => {
    //     const b64  = Buffer.from(update).toString('base64');
    //     console.info(`Document ${doc.name} updated, update (base64): ${b64}`);
    // });

    // ysocketio.on('document-loaded', (doc: Document) => {
    //     console.log(`The document ${doc.name} was loaded`);

    // });

    // ysocketio.on('document-destroy', async (doc: Document) => {
    //     console.log(`The document ${doc.name} is being destroyed`);
    // });

    // ysocketio.on('awareness-update', (doc: Document, update: Uint8Array) => {
    //     console.log(`The awareness of the document ${doc.name} is updated`);
    // });

    // ysocketio.on('all-document-connections-closed', async (doc: Document) => {
    //     console.log(`All clients of document ${doc.name} are disconected`);
    // });
    

    // Execute initialize method
    ysocketio.initialize()

    io.on(ServerSocketIOEvent.CONNECTION, async (socket) => {
        try {
            const auth:SocketHandshakeAuth = socket.handshake.auth as any;
            const githubData = await getPrivateGitHubUserData(auth.githubToken);
            const userData = await getUserPreview(auth.userId);

            if(!githubData || !userData){
                throw new Error("No user found");
            }

            const socketData: SocketData = {
                connectedAt: new Date(),
                githubAccessToken: auth.githubToken,
                user: {
                    sid: socket.id,
                    idle: false,
                    user: userData,
                }
            };
            setSocketData(socket, socketData)
            loginSocket(socket, userData.id);
        } catch (error) {
            console.warn("Error connecting "+socket.id, error);
            socket.disconnect(true);
            return;
        }

        socket.emit(ServerSE.READY);

        registerEngineSocketEvents(socket, io);
        registerCustomSocketEvents(socket, io);
    });

    io.on(ServerSocketIOEvent.CONNECTION_ERROR, (err) => {
        console.error("Connection error", err.code, err.req);
    });

    return { io };
}

export { initSockets };