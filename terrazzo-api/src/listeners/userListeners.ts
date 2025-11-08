import { ClientSE, ClientSEPayload, ClientSEReply } from '@mosaiq/terrazzo-common/socketTypes';
import { getUsersEntities, getUserPreview } from '@trz-api/controllers/userController';
import { Server, Socket } from 'socket.io';

export const registerUserListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_USER_DASH, async (data: ClientSEPayload[ClientSE.GET_USER_DASH], reply: ClientSEReply<ClientSE.GET_USER_DASH>) => {
        try {
            if (!data) {
                throw new Error('No user id provided');
            }
            const entities = await getUsersEntities(data);
            reply(entities);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.PREVIEW_USER, async (data: ClientSEPayload[ClientSE.PREVIEW_USER], reply: ClientSEReply<ClientSE.PREVIEW_USER>) => {
        try {
            if (!data) {
                throw new Error('No user id provided');
            }
            const userHeader = await getUserPreview(data);
            reply(userHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
