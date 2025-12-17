import { ClientSE, ClientSEPayload, ClientSEReplies, ClientSEReply, getRoomCode, GithubUserProfile, NonEmptyArray, RoomId, RoomType, ServerSE, ServerSEPayload, SocketHandshakeAuth, SocketId, UserData, UserId } from '@mosaiq/terrazzo-common';
import { syncUserJoinedRoom, syncUserLeftRoom } from '@trz-api/broadcasters/realtimeBroadcasters';
import { getUserPreview } from '@trz-api/controllers/userController';
import { Server, Socket } from 'socket.io';
import { isDev } from './envUtils';
import { getPrivateGitHubUserData } from './githubUtils';
import { SocketData } from './socketTypes';

/**
 * Gets all rooms the socket is currently in, excluding its own personal room.
 */
export const getSocketRooms = (socket: Socket): RoomId[] | undefined => {
    const rooms = Array.from(socket.rooms) as RoomId[];
    return rooms.filter((room) => room && room !== socket.id);
};

/**
 * Resets the socket to be in the room for the given user ID only.
 */
export const loginSocket = (socket: Socket, userId: UserId) => {
    const rooms = Array.from(socket.rooms) as RoomId[];
    const existingUserRoom = rooms.find((room) => room && room.startsWith(RoomType.USER));
    if (existingUserRoom) {
        socket.leave(existingUserRoom);
    }
    const userRoom = getRoomCode(RoomType.USER, userId);
    if (userRoom) {
        socket.join(userRoom);
    }
};

/**
 * Gets all sockets in the given room.
 */
export const getSocketsInRoom = async (io: Server, room: RoomId): Promise<Socket[]> => {
    if (!room) {
        return [];
    }
    const roomSockets = io.sockets.adapter.rooms.get(room);
    if (!roomSockets) {
        return [];
    }
    const socketIds = Array.from(roomSockets);
    return socketIds.map((socketId) => io.sockets.sockets.get(socketId)).filter((socket) => !!socket);
};

/**
 * Gets all users in the given room.
 */
export const getUsersInRoom = async (io: Server, room: RoomId): Promise<UserData[]> => {
    const sockets = await getSocketsInRoom(io, room);
    const users = sockets.map((socket) => {
        const data = socket ? getSocketData(socket) : undefined;
        return data?.user;
    });
    return users.filter((user) => !!user);
};

export interface BroadcasterOptions<T extends ServerSE> {
    io: Server;
    event: T;
    toRoomIds: NonEmptyArray<RoomId>;
    /**
     * Function to build the payload for each user based on their user data
     * @throws Error if payload cannot be built for a user. This user will be skipped.
     */
    buildPayload: (userId: UserId | undefined) => Promise<ServerSEPayload[T]> | ServerSEPayload[T];
}
/**
 * Sends an event to each user who is in at least one of the specified rooms.
 */
export const broadcast = async <T extends ServerSE>(options: BroadcasterOptions<T>) => {
    const { io, event, toRoomIds, buildPayload } = options;
    if (!toRoomIds || toRoomIds.length === 0) {
        return;
    }

    // Get all sockets to maybe send to
    const allSockets = new Set<Socket>();
    for (const roomId of toRoomIds) {
        const roomSockets = await getSocketsInRoom(io, roomId);
        roomSockets.forEach((s) => allSockets.add(s));
    }

    // Build payloads per user
    const payloads = new Map<SocketId, ServerSEPayload[T]>();
    for (const s of allSockets) {
        const socketData = getSocketData(s);
        try {
            const payload = await buildPayload(socketData.user?.user.id);
            payloads.set(s.id, payload);
        } catch (e: any) {
            console.warn(`Skipping socket in broadcast`, {
                socketId: s.id,
                userId: socketData.user?.user.id,
                event,
                error: e.message,
                stack: e.stack,
            });
        }
    }

    // Send to each socket
    for (const sock of allSockets) {
        const payload = payloads.get(sock.id);
        if (!payload) {
            continue;
        }
        sock.emit(event, payload);
    }
};

/**
 * Gets the Terrazzo-specific data stored on the socket.
 */
export const getSocketData = (socket: Socket) => {
    return (socket as any).terrazzoSocketData as SocketData;
};

/**
 * Sets the Terrazzo-specific data stored on the socket.
 */
export const setSocketData = (socket: Socket, data: SocketData) => {
    // TODO validate each field before setting to ensure no data corruption or injection
    (socket as any).terrazzoSocketData = data;
};

/**
 * Joins the socket to the given room and notifies other users in the room.
 * Returns the list of users currently in the room.
 */
export const joinRoom = async (io: Server, socket: Socket, room: RoomId): Promise<UserData[]> => {
    if (room && typeof room === 'string') {
        const rooms = getSocketRooms(socket);
        if (!rooms || rooms.find((r) => r === room)) {
            console.warn(`Socket ${socket.id} tried to join its own room ${room}`);
            return [];
        }
        const roomUsers = await getUsersInRoom(io, room);
        const socketData = getSocketData(socket);
        if (socketData?.user) {
            await syncUserJoinedRoom(io, room, socketData.user);
        }
        socket.join(room);
        return roomUsers;
    }
    console.warn(`Socket ${socket.id} tried to join an invalid room ${room}`);
    return [];
};

/**
 * Leaves the given room and notifies other users in the room.
 */
export const leaveRoom = async (io: Server, socket: Socket, room: RoomId) => {
    if (room) {
        const rooms = getSocketRooms(socket);
        if (!rooms || !rooms.find((r) => r === room)) {
            console.warn(`Socket ${socket.id} tried to leave room ${room} its not in`);
            return;
        }
        socket.leave(room);
        await syncUserLeftRoom(io, [room], socket.id);
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

export const initializeSocketData = async (socket: Socket): Promise<SocketData> => {
    try {
        const auth: SocketHandshakeAuth = socket.handshake.auth as any;
        let userData;
        if (auth.userId) {
            userData = await getUserPreview(auth.userId);
        }
        let githubData: GithubUserProfile | null = null;
        if (userData && auth.githubToken && !(isDev() && userData.githubUserId.startsWith('FAKE_'))) {
            githubData = await getPrivateGitHubUserData(auth.githubToken);
        }

        const socketData: SocketData = {
            connectedAt: new Date(),
            githubAccessToken: auth.githubToken,
            sid: socket.id,
            user: userData
                ? {
                      sid: socket.id,
                      idle: false,
                      user: userData,
                  }
                : undefined,
        };
        return socketData;
    } catch (error) {
        console.error('Error initializing socket data for ' + socket.id, error);
        socket.disconnect(true);
        throw error;
    }
};
