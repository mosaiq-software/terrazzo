import { Server, Socket } from 'socket.io';
import {RoomId, RoomType, ServerSE, ServerSEPayload, SocketId, UserData} from '@mosaiq/terrazzo-common/socketTypes';
import { SocketData } from './socketTypes';
import {getRoomCode, getRoomType} from "@mosaiq/terrazzo-common/utils/socketUtils";
import { NonEmptyArray, UID, UserId } from '@mosaiq/terrazzo-common/types';

export const getSocketRooms = (socket: Socket): RoomId[] | undefined => {
    const rooms = Array.from(socket.rooms) as RoomId[];
    return rooms.filter(room => room && room !== socket.id);
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
        const data = socket ? getSocketData(socket) : undefined;
        return data?.user;
    });
    return users as UserData[];
}

export function broadcast<T extends ServerSE>(socket:Socket, event:T, payload:ServerSEPayload[T], to:NonEmptyArray<RoomId>, returnToSender?:boolean) {
    if(!to || to.length === 0){
        return;
    }
    const socketsRooms = getSocketRooms(socket);
    let broadcaster = socket.broadcast;
    let reply = false;
    for (const rid of to){
        if(rid){
            broadcaster = broadcaster.to(rid);
            if(!reply && socketsRooms?.includes) {
                reply = true;
            }
        }
    }
    broadcaster.emit(event, payload);
    if((reply || returnToSender === true) && (returnToSender !== false)){
        socket.emit(event, payload);
    }
}

export function broadcastToMyRooms<T extends ServerSE>(socket:Socket, event:T, payload:ServerSEPayload[T], include:NonEmptyArray<RoomType>, returnToSender?:boolean) {
    const rooms = getSocketRooms(socket)?.filter((r)=> !!r && include.includes(getRoomType(r)));
    if(rooms && rooms.length > 0){
        broadcast<T>(socket, event, payload, rooms as NonEmptyArray<RoomId>, returnToSender);
    }
}

export const getSocketData = (socket: Socket) => {
    return (socket as any).terrazzoSocketData as SocketData;
}
export const setSocketData = (socket: Socket, data: SocketData) => {
    // TODO validate each field before setting to ensure no data corruption or injection
    (socket as any).terrazzoSocketData = data;
}

export const joinRoom = async (io: Server, socket: Socket, room: RoomId): Promise<UserData[]> => {
    if (room && typeof room === 'string') {
        const rooms = getSocketRooms(socket);
        if(!rooms || rooms.find(r=>r===room)){
            console.warn(`Socket ${socket.id} tried to join its own room ${room}`);
            return [];
        }
        const roomUsers = await getUsersInRoom(io, room);
        const socketData = getSocketData(socket);
        broadcast<ServerSE.CLIENT_JOINED_ROOM>(socket, ServerSE.CLIENT_JOINED_ROOM, { ...socketData.user, sid: socket.id }, [room]);
        socket.join(room);
        return roomUsers;
    }
    console.warn(`Socket ${socket.id} tried to join an invalid room ${room}`);
    return [];
}

export const leaveRoom = (socket: Socket, room:RoomId) => {
    if (room) {
        const rooms = getSocketRooms(socket);
        if(!rooms || !rooms.find(r=>r===room)){
            console.warn(`Socket ${socket.id} tried to leave room ${room} its not in`);
            return;
        } 
        socket.leave(room);
        broadcast<ServerSE.CLIENT_LEFT_ROOM>(socket, ServerSE.CLIENT_LEFT_ROOM, socket.id, [room]);
    }
}