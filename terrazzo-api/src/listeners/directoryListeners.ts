import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { createDirectory, getDirectory, updateDirectory } from '@trz-api/controllers/directoryController';
import { broadcast, broadcastUniqueUpdatesForUpdatedModule } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDirectoryListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_DIRECTORY, async (data: ClientSEPayload[ClientSE.GET_DIRECTORY], reply: ClientSEReply<ClientSE.GET_DIRECTORY>) => {
        try {
            const directoryHeader = await getDirectory(data);
            reply(directoryHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

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
            const updatedDir = await getDirectory(data.id);
            if (!updatedDir) {
                throw new Error('No directory found');
            }
            broadcast<ServerSE.UPDATE_DIRECTORY_FIELD>(socket, ServerSE.UPDATE_DIRECTORY_FIELD, updatedDir, [getRoomCode(RoomType.DATA, data.id)]);
            await broadcastUniqueUpdatesForUpdatedModule(socket, io, data.id);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
