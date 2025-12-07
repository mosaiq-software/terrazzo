import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncMouseMove, syncUserIdle } from '@trz-api/broadcasters';
import { getSocketData, joinRoom, leaveRoom, setSocketData, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerCustomSocketEvents = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.JOIN_ROOM, async (room) => {
        const roomUsers = await joinRoom(io, socket, room);
        return roomUsers;
    });

    subscribe(socket, ClientSE.LEAVE_ROOM, async (room) => {
        await leaveRoom(io, socket, room);
        return undefined;
    });

    subscribe(socket, ClientSE.MOUSE_MOVE, async (data) => {
        const socketData = getSocketData(socket);
        socketData.user.mouseRoomData = data;
        setSocketData(socket, socketData);
        await syncMouseMove(io, data.contextId, socket.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.USER_IDLE, async (data) => {
        const socketData = getSocketData(socket);
        socketData.user.idle = data;
        setSocketData(socket, socketData);
        if (socketData.user.mouseRoomData) {
            await syncUserIdle(io, socketData.user.mouseRoomData.contextId, socket.id, data);
        }
        return undefined;
    });
};
