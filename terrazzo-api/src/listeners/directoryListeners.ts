import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { createDirectory, getDirectory, updateDirectory } from '@trz-api/controllers/directoryController';
import { broadcast, broadcastUniqueUpdatesForUpdatedModule } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDirectoryListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.CREATE_DIRECTORY, async (data: ClientSEPayload[ClientSE.CREATE_DIRECTORY], reply: ClientSEReply<ClientSE.CREATE_DIRECTORY>) => {
        try {
            const directoryHeader = await createDirectory(data.name, data.parentId);
            reply(directoryHeader);

            if (!directoryHeader.parentId) {
                return;
            }
            const directory = await getDirectory(directoryHeader.parentId);
            if (!directory) {
                return;
            }
            broadcast(socket, ServerSE.UPDATE_DIRECTORY, directory, [getRoomCode(RoomType.DATA, directory.id)]);
            await broadcastUniqueUpdatesForUpdatedModule(socket, io, directory.id);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_DIRECTORY, async (data: ClientSEPayload[ClientSE.GET_DIRECTORY], reply: ClientSEReply<ClientSE.GET_DIRECTORY>) => {
        try {
            const directory = await getDirectory(data);
            reply(directory);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_DIRECTORY_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_DIRECTORY_FIELD], reply: ClientSEReply<ClientSE.UPDATE_DIRECTORY_FIELD>) => {
        try {
            await updateDirectory(data.id, data);
            const directory = await getDirectory(data.id);
            if (directory) {
                broadcast(socket, ServerSE.UPDATE_DIRECTORY, directory, [getRoomCode(RoomType.DATA, directory.id)]);
                await broadcastUniqueUpdatesForUpdatedModule(socket, io, directory.id);
            }
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
