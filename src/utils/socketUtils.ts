import { Server, Socket } from 'socket.io';
import {RoomId, RoomType, ServerSE, ServerSEPayload, SocketId, UserData} from '@mosaiq/terrazzo-common/socketTypes';
import { SocketData } from './socketTypes';
import {getRoomCode} from "@mosaiq/terrazzo-common/utils/socketUtils";
import { UID, UserId } from '@mosaiq/terrazzo-common/types';

export const getSocketRoom = (socket: Socket): RoomId | undefined => {
    const rooms = Array.from(socket.rooms) as RoomId[];
    return rooms.find(room => room && room !== socket.id && !room.startsWith(RoomType.USER));
}
export const logoutSocket = (socket: Socket) => {
    const rooms = Array.from(socket.rooms) as RoomId[];
    const userRoom = rooms.find(room => room && room.startsWith(RoomType.USER));
    if(userRoom){
        socket.leave(userRoom);
    }
}
export const loginSocket = (socket: Socket, userId: UserId) => {
    logoutSocket(socket);
    const userRoom = getRoomCode(RoomType.USER, userId);
    if(userRoom) {
        socket.join(userRoom);
    }
}

export const getUsersInRoom = async (io: Server, room: RoomId): Promise<UserData[]> => {
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
export const broadcastToSocket = (socket: Socket, toSocketId:SocketId, event: ServerSE, payload: ServerSEPayload[keyof ServerSEPayload]) => {
    socket.broadcast.to(toSocketId).emit(event, payload);
}
export const broadcastToUser = (socket: Socket, toUserId:UserId, event: ServerSE, payload: ServerSEPayload[keyof ServerSEPayload]) => {
    broadcastToAnotherRoom(socket, RoomType.USER, toUserId, event, payload);
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
        const roomUsers = await getUsersInRoom(io, room);
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