import { ClientSE, ClientSEPayload, ClientSEReply } from '@mosaiq/terrazzo-common';
import { getUserPreview } from '@trz-api/controllers/userController';
import { Server, Socket } from 'socket.io';

export const registerUserListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_USER, async (data: ClientSEPayload[ClientSE.GET_USER], reply: ClientSEReply<ClientSE.GET_USER>) => {
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
