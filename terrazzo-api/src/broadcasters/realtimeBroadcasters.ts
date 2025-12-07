import { BoardId, getRoomCode, MouseRoomUserData, NonEmptyArray, RoomId, RoomType, ServerSE, SocketId, UserData } from '@mosaiq/terrazzo-common';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server } from 'socket.io';

export const syncUserJoinedRoom = async (io: Server, roomId: RoomId, userData: UserData) => {
    // broadcast(socket, ServerSE.CLIENT_JOINED_ROOM, { ...socketData.user, sid: socket.id }, [room]);
    broadcast({
        io,
        event: ServerSE.CLIENT_JOINED_ROOM,
        toRoomIds: [roomId],
        buildPayload: async () => {
            // No permission check needed for joining room. It would be expensive and not sensitive data.
            return userData;
        },
    });
};

export const syncUserLeftRoom = async (io: Server, roomIds: NonEmptyArray<RoomId>, socketId: SocketId) => {
    // broadcast(socket, ServerSE.CLIENT_LEFT_ROOM, { sid: socket.id }, [room]);
    broadcast({
        io,
        event: ServerSE.CLIENT_LEFT_ROOM,
        toRoomIds: roomIds,
        buildPayload: async () => {
            // No permission check needed for leaving room. It would be expensive and not sensitive data.
            return socketId;
        },
    });
};

export const syncMouseMove = async (io: Server, boardId: BoardId, sid: SocketId, mouseRoomData: MouseRoomUserData) => {
    broadcast({
        io,
        event: ServerSE.MOUSE_MOVE,
        toRoomIds: [getRoomCode(RoomType.MOUSE, boardId)],
        buildPayload: async () => {
            // No permission check needed for mouse move. It would be expensive and not sensitive data.
            return { sid: sid, data: mouseRoomData };
        },
    });
};

export const syncUserIdle = async (io: Server, boardId: BoardId, sid: SocketId, idle: boolean) => {
    broadcast({
        io,
        event: ServerSE.USER_IDLE,
        toRoomIds: [getRoomCode(RoomType.MOUSE, boardId)],
        buildPayload: async () => {
            // No permission check needed for user idle. It would be expensive and not sensitive data.
            return { sid: sid, idle: idle };
        },
    });
};
