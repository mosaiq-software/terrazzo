import { ClientSE, ClientSEPayload, ClientSEReply } from '@mosaiq/terrazzo-common/socketTypes';
import { createDirectory, updateDirectory } from '@trz-api/controllers/directoryController';
import { broadcastUniqueUpdatesForUpdatedModule } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDirectoryListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.CREATE_DIRECTORY, async (data: ClientSEPayload[ClientSE.CREATE_DIRECTORY], reply: ClientSEReply<ClientSE.CREATE_DIRECTORY>) => {
        try {
            const directoryHeader = await createDirectory(data.name, data.parentId);
            reply(directoryHeader);
            await broadcastUniqueUpdatesForUpdatedModule(socket, io, directoryHeader.id);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_DIRECTORY_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_DIRECTORY_FIELD], reply: ClientSEReply<ClientSE.UPDATE_DIRECTORY_FIELD>) => {
        try {
            await updateDirectory(data.id, data);
            await broadcastUniqueUpdatesForUpdatedModule(socket, io, data.id);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
