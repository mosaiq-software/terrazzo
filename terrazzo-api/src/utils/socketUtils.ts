import { ClientSE, ClientSEPayload, ClientSEReplies, ClientSEReply, getRoomCode, getRoomType, NonEmptyArray, RoomId, RoomType, ServerSE, ServerSEPayload, UserData, UserId } from '@mosaiq/terrazzo-common';
import { Server, Socket } from 'socket.io';
import { SocketData } from './socketTypes';

export const getSocketRooms = (socket: Socket): RoomId[] | undefined => {
    const rooms = Array.from(socket.rooms) as RoomId[];
    return rooms.filter((room) => room && room !== socket.id);
};
export const logoutSocket = (socket: Socket) => {
    const rooms = Array.from(socket.rooms) as RoomId[];
    const userRoom = rooms.find((room) => room && room.startsWith(RoomType.USER));
    if (userRoom) {
        socket.leave(userRoom);
    }
};
export const loginSocket = (socket: Socket, userId: UserId) => {
    logoutSocket(socket);
    const userRoom = getRoomCode(RoomType.USER, userId);
    if (userRoom) {
        socket.join(userRoom);
    }
};

export const getUsersInRoom = async (io: Server, room: RoomId): Promise<UserData[]> => {
    if (!room) {
        return [];
    }
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) {
        return [];
    }
    const sockets = Array.from(roomSockets);
    const users = sockets.map((socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        const data = socket ? getSocketData(socket) : undefined;
        return data?.user;
    });
    return users as UserData[];
};

export function broadcast<T extends ServerSE>(socket: Socket, event: T, payload: ServerSEPayload[T], to: NonEmptyArray<RoomId>, returnToSender?: boolean) {
    if (!to || to.length === 0) {
        return;
    }
    const socketsRooms = getSocketRooms(socket);
    let broadcaster = socket.broadcast;
    let reply = false;
    for (const rid of to) {
        if (rid) {
            broadcaster = broadcaster.to(rid);
            if (!reply && socketsRooms?.includes) {
                reply = true;
            }
        }
    }
    broadcaster.emit(event, payload);
    if ((reply || returnToSender === true) && returnToSender !== false) {
        socket.emit(event, payload);
    }
}

export function broadcastToMyRooms<T extends ServerSE>(socket: Socket, event: T, payload: ServerSEPayload[T], include: NonEmptyArray<RoomType>, returnToSender?: boolean) {
    const rooms = getSocketRooms(socket)?.filter((r) => !!r && include.includes(getRoomType(r)));
    if (rooms && rooms.length > 0) {
        broadcast(socket, event, payload, rooms as NonEmptyArray<RoomId>, returnToSender);
    }
}

export const getSocketData = (socket: Socket) => {
    return (socket as any).terrazzoSocketData as SocketData;
};
export const setSocketData = (socket: Socket, data: SocketData) => {
    // TODO validate each field before setting to ensure no data corruption or injection
    (socket as any).terrazzoSocketData = data;
};

export const joinRoom = async (io: Server, socket: Socket, room: RoomId): Promise<UserData[]> => {
    if (room && typeof room === 'string') {
        const rooms = getSocketRooms(socket);
        if (!rooms || rooms.find((r) => r === room)) {
            console.warn(`Socket ${socket.id} tried to join its own room ${room}`);
            return [];
        }
        const roomUsers = await getUsersInRoom(io, room);
        const socketData = getSocketData(socket);
        broadcast(socket, ServerSE.CLIENT_JOINED_ROOM, { ...socketData.user, sid: socket.id }, [room]);
        socket.join(room);
        return roomUsers;
    }
    console.warn(`Socket ${socket.id} tried to join an invalid room ${room}`);
    return [];
};

export const leaveRoom = (socket: Socket, room: RoomId) => {
    if (room) {
        const rooms = getSocketRooms(socket);
        if (!rooms || !rooms.find((r) => r === room)) {
            console.warn(`Socket ${socket.id} tried to leave room ${room} its not in`);
            return;
        }
        socket.leave(room);
        broadcast(socket, ServerSE.CLIENT_LEFT_ROOM, socket.id, [room]);
    }
};

export type SubOptions = {
    allowEmptyData?: boolean;
};
/**
 * Subscribes to a client socket event with built-in error handling.
 * @param toEvent The client event to subscribe to
 * @param cb The callback to execute when the event is received
 * @param options Subscription options
 */
export const subscribe = <T extends ClientSE>(socket: Socket, toEvent: T, cb: (data: ClientSEPayload[T]) => Promise<ClientSEReplies[T]>, options?: SubOptions) => {
    socket.on(toEvent as any, async (data: ClientSEPayload[T], reply: ClientSEReply<T>) => {
        try {
            if (data === undefined && options?.allowEmptyData !== true) {
                throw new Error('No data provided');
            }
            const returnedReply = await cb(data);
            reply(returnedReply);
        } catch (error: any) {
            console.error(`Event Error`, {
                event: toEvent,
                data,
                error: error.message,
                stack: error.stack,
                options,
            });
            reply(undefined as ClientSEReplies[T], error.message);
        }
    });
};
