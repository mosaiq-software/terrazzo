import { ClientSE } from '@mosaiq/terrazzo-common';
import { getTextBlockByIdDb } from '@trz-api/persistence/textBlockPersistence';
import { subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerTextListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_TEXT_BLOCK, async (data) => {
        const textBlock = await getTextBlockByIdDb(data);
        if (textBlock === null) {
            throw new Error(`Text block ${data} not found`);
        }
        return textBlock;
    });
};
