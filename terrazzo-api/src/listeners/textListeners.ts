import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common/socketTypes';
import { getTextBlockById } from '@trz-api/persistence/textBlockPersistence';
import { broadcastToMyRooms, getSocketData, setSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerTextListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_TEXT_BLOCK, async (data: ClientSEPayload[ClientSE.GET_TEXT_BLOCK], reply: ClientSEReply<ClientSE.GET_TEXT_BLOCK>) => {
        try {
            if (!data) {
                throw new Error('No id provided');
            }
            const textBlock = await getTextBlockById(data);
            if (textBlock === null) {
                throw new Error(`Text block ${data} not found`);
            }
            reply(textBlock);
        } catch (error: any) {
            console.error('Error getting text block', data, error);
            reply(undefined, 'Error getting text block');
        }
    });

    socket.on(ClientSE.TEXT_CARET, (data: ClientSEPayload[ClientSE.TEXT_CARET], reply: ClientSEReply<ClientSE.TEXT_CARET>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.textRoomData = { caret: data };
            setSocketData(socket, socketData);
            const payload: ServerSEPayload[ServerSE.TEXT_CARET] = { sid: socket.id, caret: data };
            broadcastToMyRooms(socket, ServerSE.TEXT_CARET, payload, [RoomType.TEXT], false);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
