import { allRoomTypes, ServerSE, ServerSocketIOEvent } from '@mosaiq/terrazzo-common';
import { Server, Socket } from 'socket.io';
import { broadcastToMyRooms } from './socketUtils';

export const registerEngineSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ServerSocketIOEvent.DISCONNECTING, (reason) => {
        broadcastToMyRooms<ServerSE.CLIENT_LEFT_ROOM>(socket, ServerSE.CLIENT_LEFT_ROOM, socket.id, allRoomTypes());
    });

    socket.on(ServerSocketIOEvent.DISCONNECT, () => {});
};
