import { ClientSE, RoomType, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common';
import { getTextBlockById } from '@trz-api/persistence/textBlockPersistence';
import { broadcastToMyRooms, getSocketData, setSocketData, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerTextListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_TEXT_BLOCK, async (data) => {
        const textBlock = await getTextBlockById(data);
        if (textBlock === null) {
            throw new Error(`Text block ${data} not found`);
        }
        return textBlock;
    });

    sub(socket, ClientSE.TEXT_CARET, async (data) => {
        const socketData = getSocketData(socket);
        socketData.user.textRoomData = { caret: data };
        setSocketData(socket, socketData);
        const payload: ServerSEPayload[ServerSE.TEXT_CARET] = { sid: socket.id, caret: data };
        broadcastToMyRooms(socket, ServerSE.TEXT_CARET, payload, [RoomType.TEXT], false);
        return undefined;
    });
};
