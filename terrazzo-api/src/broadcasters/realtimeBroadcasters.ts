import {
    getRoomCode,
    ModuleId,
    MouseRoomUserData,
    NonEmptyArray,
    RoomId,
    RoomType,
    ServerSE,
    SocketId,
    UserData,
} from '@mosaiq/terrazzo-common';
import { broadcast } from '@trz-api/utils/socket/socketActions';

export const syncUserJoinedRoom = async (roomId: RoomId, userData: UserData) => {
    // broadcast(socket, ServerSE.CLIENT_JOINED_ROOM, { ...socketData.user, sid: socket.id }, [room]);
    broadcast({
        event: ServerSE.CLIENT_JOINED_ROOM,
        toRoomIds: [roomId],
        buildPayload: async () => {
            // No permission check needed for joining room. It would be expensive and not sensitive data.
            return userData;
        },
    });
};

export const syncUserLeftRoom = async (roomIds: NonEmptyArray<RoomId>, socketId: SocketId) => {
    // broadcast(socket, ServerSE.CLIENT_LEFT_ROOM, { sid: socket.id }, [room]);
    broadcast({
        event: ServerSE.CLIENT_LEFT_ROOM,
        toRoomIds: roomIds,
        buildPayload: async () => {
            // No permission check needed for leaving room. It would be expensive and not sensitive data.
            return socketId;
        },
    });
};

export const syncMouseMove = async (boardId: ModuleId, sid: SocketId, mouseRoomData: MouseRoomUserData) => {
    broadcast({
        event: ServerSE.MOUSE_MOVE,
        toRoomIds: [getRoomCode(RoomType.MOUSE, boardId)],
        buildPayload: async () => {
            // No permission check needed for mouse move. It would be expensive and not sensitive data.
            return { sid: sid, data: mouseRoomData };
        },
    });
};

export const syncUserIdle = async (boardId: ModuleId, sid: SocketId, idle: boolean) => {
    broadcast({
        event: ServerSE.USER_IDLE,
        toRoomIds: [getRoomCode(RoomType.MOUSE, boardId)],
        buildPayload: async () => {
            // No permission check needed for user idle. It would be expensive and not sensitive data.
            return { sid: sid, idle: idle };
        },
    });
};
