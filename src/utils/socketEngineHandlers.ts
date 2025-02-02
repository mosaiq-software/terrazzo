import { Server, Socket } from 'socket.io';
import { broadcastToMyRoom, getSocketRoom } from './socketUtils';
import { ServerSE, ServerSEPayload, ServerSocketIOEvent } from '@mosaiq/terrazzo-common/socketTypes';


export const registerEngineSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ServerSocketIOEvent.DISCONNECTING, (reason) => {
        const payload: ServerSEPayload[ServerSE.CLIENT_LEFT_ROOM] = socket.id;
        broadcastToMyRoom(socket, ServerSE.CLIENT_LEFT_ROOM, payload);
    });
    
    socket.on(ServerSocketIOEvent.DISCONNECT, () => {
    });
};