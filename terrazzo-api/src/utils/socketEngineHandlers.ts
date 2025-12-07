import { NonEmptyArray, RoomId, ServerSocketIOEvent } from '@mosaiq/terrazzo-common';
import { syncUserLeftRoom } from '@trz-api/broadcasters';
import { Server, Socket } from 'socket.io';
import { getSocketRooms } from './socketUtils';

export const registerEngineSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ServerSocketIOEvent.DISCONNECTING, (reason) => {
        const usersRooms = getSocketRooms(socket);
        if (!usersRooms?.length) {
            return;
        }
        syncUserLeftRoom(io, usersRooms as NonEmptyArray<RoomId>, socket.id);
    });

    socket.on(ServerSocketIOEvent.DISCONNECT, () => {});
};
