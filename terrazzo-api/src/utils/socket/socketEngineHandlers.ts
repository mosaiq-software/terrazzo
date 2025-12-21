import { NonEmptyArray, RoomId, ServerSocketIOEvent } from '@mosaiq/terrazzo-common';
import { syncUserLeftRoom } from '@trz-api/broadcasters';
import { Socket } from 'socket.io';
import { getSocketRooms } from './socketUtils';

export const registerEngineSocketEvents = (socket: Socket) => {
    socket.on(ServerSocketIOEvent.DISCONNECTING, (reason) => {
        const usersRooms = getSocketRooms(socket);
        if (!usersRooms?.length) {
            return;
        }
        syncUserLeftRoom(usersRooms as NonEmptyArray<RoomId>, socket.id);
    });

    socket.on(ServerSocketIOEvent.DISCONNECT, () => {});
};
