import { ClientSE, ClientSEPayload, ClientSEReply } from '@mosaiq/terrazzo-common/socketTypes';
import { getOrgDirectoryTreeForUser } from '@trz-api/controllers/membershipController';
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

    socket.on(ClientSE.GET_USERS_DIRECTORY_STRUCTURE, async (data: ClientSEPayload[ClientSE.GET_USERS_DIRECTORY_STRUCTURE], reply: ClientSEReply<ClientSE.GET_USERS_DIRECTORY_STRUCTURE>) => {
        try {
            if (!data || !data.userId || !data.orgId) {
                throw new Error('Invalid data provided');
            }
            const directoryStructure = await getOrgDirectoryTreeForUser(data.orgId, data.userId);
            reply(directoryStructure ?? undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
