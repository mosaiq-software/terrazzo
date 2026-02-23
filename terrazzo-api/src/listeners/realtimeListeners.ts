import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncMouseMove, syncUserIdle } from '@trz-api/broadcasters';
import { joinRoom, leaveRoom, subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData, setSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerCustomSocketEvents = (socket: Socket) => {
    subscribe(socket, ClientSE.JOIN_ROOM, async (room) => {
        const roomUsers = await joinRoom(socket, room);
        return roomUsers;
    });

    subscribe(socket, ClientSE.LEAVE_ROOM, async (room) => {
        await leaveRoom(socket, room);
        return undefined;
    });

    subscribe(socket, ClientSE.MOUSE_MOVE, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            return undefined;
        }
        socketData.user.mouseRoomData = data;
        setSocketData(socket, socketData);
        await syncMouseMove(data.contextId, socket.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.USER_IDLE, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            return undefined;
        }
        socketData.user.idle = data;
        setSocketData(socket, socketData);
        if (socketData.user.mouseRoomData) {
            await syncUserIdle(socketData.user.mouseRoomData.contextId, socket.id, data);
        }
        return undefined;
    });
};
