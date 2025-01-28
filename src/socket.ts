import { createServer } from 'http';
import { Server } from 'socket.io';

interface SocketConnections {
    id: string;
    address: string;
    connectedAt: Date;
}

enum SocketIOEvents {
    CONNECTION = 'connection',
    DISCONNECT = 'disconnect',
}
enum LowBandSocketEvents {
    CLIENT_CONNECTED = 'l_clientConnected',
    CLIENT_DISCONNECTED = 'l_clientDisconnected',
    MESSAGE = 'l_message',
    BROADCAST = 'l_broadcast',
}
enum HighBandSocketEvents {
    CLIENT_CONNECTED = 'h_clientConnected',
    CLIENT_DISCONNECTED = 'h_clientDisconnected',
    AUTH_REQUEST = 'h_authRequest',
    AUTH_RESPONSE = 'h_authResponse',
    MESSAGE = 'h_message',
    BROADCAST = 'h_broadcast',
    ACK = 'h_ack',
}

const initSockets = () => {
    const lowBandConnections: SocketConnections[] = [];
    const highBandConnections: SocketConnections[] = [];

    console.info("Starting sockets");
    const lowBandServer = createServer();
    const highBandServer = createServer();

    const lowIO = new Server(lowBandServer,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    const highIO = new Server(highBandServer,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    lowIO.on(SocketIOEvents.CONNECTION, (socket) => {
        lowBandConnections.push({
            id: socket.id,
            address: socket.handshake.address,
            connectedAt: new Date()
        });
        socket.broadcast.emit(LowBandSocketEvents.CLIENT_CONNECTED, socket.id);

        socket.on(SocketIOEvents.DISCONNECT, () => {
            socket.broadcast.emit(LowBandSocketEvents.CLIENT_DISCONNECTED, socket.id);
            lowBandConnections.splice(lowBandConnections.findIndex((element) => element.id === socket.id), 1);
        });
    });

    highIO.on(SocketIOEvents.CONNECTION, (socket) => {
        highBandConnections.push({
            id: socket.id,
            address: socket.handshake.address,
            connectedAt: new Date()
        });
        socket.broadcast.emit(HighBandSocketEvents.CLIENT_CONNECTED, socket.id);

        socket.on(SocketIOEvents.DISCONNECT, () => {
            socket.broadcast.emit(HighBandSocketEvents.CLIENT_DISCONNECTED, socket.id);
            highBandConnections.splice(highBandConnections.findIndex((element) => element.id === socket.id), 1);
        });
    });

    return { lowBandServer, highBandServer };
}

export { initSockets };