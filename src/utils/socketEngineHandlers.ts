import { Server, Socket } from 'socket.io';
import { broadcastToMyRooms } from './socketUtils';
import { ServerSE, ServerSocketIOEvent } from '@mosaiq/terrazzo-common/socketTypes';
import { allRoomTypes } from '@mosaiq/terrazzo-common/utils/socketUtils';

export const registerEngineSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ServerSocketIOEvent.DISCONNECTING, (reason) => {
        broadcastToMyRooms<ServerSE.CLIENT_LEFT_ROOM>(socket, ServerSE.CLIENT_LEFT_ROOM, socket.id, allRoomTypes());
    });

    socket.on(ServerSocketIOEvent.DISCONNECT, () => {});
};
