import { ClientSE, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { broadcastToMyRooms, getSocketData, joinRoom, leaveRoom, setSocketData, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerCustomSocketEvents = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.JOIN_ROOM, async (room) => {
        const roomUsers = await joinRoom(io, socket, room);
        return roomUsers;
    });

    sub(socket, ClientSE.LEAVE_ROOM, async (room) => {
        leaveRoom(socket, room);
        return undefined;
    });

    sub(socket, ClientSE.MOUSE_MOVE, async (data) => {
        const socketData = getSocketData(socket);
        socketData.user.mouseRoomData = data;
        setSocketData(socket, socketData);
        broadcastToMyRooms<ServerSE.MOUSE_MOVE>(socket, ServerSE.MOUSE_MOVE, { sid: socket.id, data: data }, [RoomType.MOUSE], false);
        return undefined;
    });

    sub(socket, ClientSE.USER_IDLE, async (data) => {
        const socketData = getSocketData(socket);
        socketData.user.idle = data;
        setSocketData(socket, socketData);
        broadcastToMyRooms<ServerSE.USER_IDLE>(socket, ServerSE.USER_IDLE, { sid: socket.id, idle: data }, [RoomType.MOUSE, RoomType.TEXT], false);
        return undefined;
    });
};
