import { Server, Socket } from 'socket.io';
import {RoomId, RoomType, ServerSE, ServerSEPayload, UserData} from '@mosaiq/terrazzo-common/socketTypes';
import { SocketData } from './socketTypes';
import {getRoomCode} from "@mosaiq/terrazzo-common/utils/socketUtils";
import { UID } from '@mosaiq/terrazzo-common/types';

export const getSocketRoom = (socket: Socket): RoomId | undefined => {
    return (Array.from(socket.rooms).find(room => room !== socket.id) as RoomId) ?? undefined;
}

export const getSocketsInRoom = async (io: Server, room: RoomId): Promise<UserData[]> => {
    if (!room) {
        return [];
    }
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) {
        return [];
    }
    const sockets = Array.from(roomSockets);
    const users = sockets.map(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        return socket?.data.user;
    });
    return users as UserData[];
}

export const broadcast = (socket: Socket, to: RoomId | undefined, event: ServerSE, payload: ServerSEPayload[ServerSE]) => {
    if (!to) {
        return;
    }
    socket.broadcast.to(to).emit(event, payload);
}

export const broadcastToMyRoom = (socket: Socket, event: ServerSE, payload: ServerSEPayload[keyof ServerSEPayload]) => {
    const room = getSocketRoom(socket);
    if (room) {
        socket.broadcast.to(room).emit(event, payload);
    }
}
export const broadcastToAnotherRoom = (socket: Socket, roomType: RoomType, uid: UID, event: ServerSE, payload: ServerSEPayload[keyof ServerSEPayload]) => {
    const room = getRoomCode(roomType, uid);
    if (room) {
        socket.broadcast.to(room).emit(event, payload);
    }
}
export const broadcastToAll = (io: Server, event: ServerSE, payload: ServerSEPayload[keyof ServerSEPayload]) => {
    io.emit(event, payload);
}

export const broadcastToMyselfAndMyRoom = (socket: Socket, event: ServerSE, payload: ServerSEPayload[keyof ServerSEPayload]) => {
    const room = getSocketRoom(socket);
    if (room) {
        socket.emit(event, payload);
        socket.broadcast.to(room).emit(event, payload);
    }
}

export const getSocketData = (socket: Socket) => {
    return socket.data as SocketData;
}

export const setSocketData = (socket: Socket, data: SocketData) => {
    // TODO validate each field before setting to ensure no data corruption or injection
    socket.data = data;
}

export const joinRoom = async (io: Server, socket: Socket, room: RoomId): Promise<UserData[]> => {
    if (room && typeof room === 'string') {
        const roomUsers = await getSocketsInRoom(io, room);
        const socketData = getSocketData(socket);
        const payload: ServerSEPayload[ServerSE.CLIENT_JOINED_ROOM] = { ...socketData.user, sid: socket.id }
        broadcast(socket, room, ServerSE.CLIENT_JOINED_ROOM, payload);
        socket.join(room);
        return roomUsers;
    }
    return [];
}

export const leaveRoom = (socket: Socket) => {
    const currentRoom = getSocketRoom(socket);
    if (currentRoom) {
        socket.leave(currentRoom);
        const payload: ServerSEPayload[ServerSE.CLIENT_LEFT_ROOM] = socket.id;
        broadcast(socket, currentRoom, ServerSE.CLIENT_LEFT_ROOM, payload);
    }
}