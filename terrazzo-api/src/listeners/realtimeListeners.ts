import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { broadcastToMyRooms, getSocketData, joinRoom, leaveRoom, setSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerCustomSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ClientSE.JOIN_ROOM, async (room: ClientSEPayload[ClientSE.JOIN_ROOM], reply: ClientSEReply<ClientSE.JOIN_ROOM>) => {
        try {
            const roomUsers = await joinRoom(io, socket, room);
            reply(roomUsers);
        } catch (error: any) {
            reply([], error.message);
        }
    });

    socket.on(ClientSE.LEAVE_ROOM, async (room: ClientSEPayload[ClientSE.LEAVE_ROOM], reply: ClientSEReply<ClientSE.LEAVE_ROOM>) => {
        try {
            leaveRoom(socket, room);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.MOUSE_MOVE, (data: ClientSEPayload[ClientSE.MOUSE_MOVE], reply: ClientSEReply<ClientSE.MOUSE_MOVE>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.mouseRoomData = data;
            setSocketData(socket, socketData);
            broadcastToMyRooms<ServerSE.MOUSE_MOVE>(socket, ServerSE.MOUSE_MOVE, { sid: socket.id, data: data }, [RoomType.MOUSE], false);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.USER_IDLE, (data: ClientSEPayload[ClientSE.USER_IDLE], reply: ClientSEReply<ClientSE.USER_IDLE>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.idle = data;
            setSocketData(socket, socketData);
            broadcastToMyRooms<ServerSE.USER_IDLE>(socket, ServerSE.USER_IDLE, { sid: socket.id, idle: data }, [RoomType.MOUSE, RoomType.TEXT], false);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
