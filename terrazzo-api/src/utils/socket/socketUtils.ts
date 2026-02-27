import { getRoomCode, RoomId, RoomType, SocketHandshakeAuth, UserData, UserId } from '@mosaiq/terrazzo-common';
import { signInWithExistingAuth } from '@trz-api/controllers/authController';
import { Socket } from 'socket.io';
import { SocketData, YSocketData } from './socketTypes';

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

export const getValidAuthSessionFromSocketHandshake = async (auth: SocketHandshakeAuth) => {
    if (auth.userId && auth.authToken) {
        const authSession = await signInWithExistingAuth({ userId: auth.userId, trzAuthToken: auth.authToken });
        return authSession;
    }
    return undefined;
};

export const initializeSocketData = async (socket: Socket): Promise<SocketData> => {
    try {
        const auth: SocketHandshakeAuth = socket.handshake.auth as any;
        const authSession = await getValidAuthSessionFromSocketHandshake(auth);
        let userData: UserData | undefined = undefined;
        if (authSession) {
            userData = {
                sid: socket.id,
                idle: false,
                userId: authSession.userId,
            };
        }

        const socketData: SocketData = {
            connectedAt: new Date(),
            authToken: auth.authToken,
            sid: socket.id,
            user: userData,
        };
        return socketData;
    } catch (error) {
        console.error('Error initializing socket data for ' + socket.id, error);
        throw error;
    }
};

/**
 * Gets the Terrazzo-specific data stored on the socket.
 */
export const getSocketData = (socket: Socket): SocketData | undefined => {
    return (socket as any)?.terrazzoSocketData as SocketData | undefined;
};

/**
 * Sets the Terrazzo-specific data stored on the socket.
 */
export const setSocketData = (socket: Socket, data: SocketData) => {
    (socket as any).terrazzoSocketData = data;
};

/**
 * Gets the Terrazzo-specific data stored on the socket.
 */
export const getYSocketData = (socket: Socket): YSocketData | undefined => {
    return (socket as any)?.terrazzoSocketData as YSocketData | undefined;
};

/**
 * Sets the Terrazzo-specific data stored on the socket.
 */
export const setYSocketData = (socket: Socket, data: YSocketData) => {
    (socket as any).terrazzoSocketData = data;
};
