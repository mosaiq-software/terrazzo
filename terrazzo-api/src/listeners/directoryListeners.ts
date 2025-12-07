import { ClientSE, ClientSEPayload, ClientSEReply, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createDirectory, getDirectory, getDirectoryContents, updateDirectory, updateDirectoryContents } from '@trz-api/controllers/directoryController';
import { syncDirectoryContents } from '@trz-api/utils/broadcasters';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDirectoryListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_DIRECTORY, async (data: ClientSEPayload[ClientSE.GET_DIRECTORY], reply: ClientSEReply<ClientSE.GET_DIRECTORY>) => {
        try {
            if (!data) {
                throw new Error('No directory id provided');
            }
            if (!(await userCanViewModule(socket, data))) {
                throw new Error('User does not have permission to view this directory');
            }
            const directoryHeader = await getDirectory(data);
            reply(directoryHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_DIRECTORY, async (data: ClientSEPayload[ClientSE.CREATE_DIRECTORY], reply: ClientSEReply<ClientSE.CREATE_DIRECTORY>) => {
        try {
            if (!data) {
                throw new Error('No directory data provided');
            }
            if (!(await userCanEditModule(socket, data.parentId))) {
                throw new Error('User does not have permission to create a directory in this module');
            }
            const directoryHeader = await createDirectory(data.name, data.parentId);
            await syncDirectoryContents(socket, directoryHeader.parentId);
            reply(directoryHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_DIRECTORY_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_DIRECTORY_FIELD], reply: ClientSEReply<ClientSE.UPDATE_DIRECTORY_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No directory data provided');
            }
            if (!(await userCanEditModule(socket, data.id))) {
                throw new Error('User does not have permission to edit this directory');
            }
            await updateDirectory(data.id, data);
            const updatedDir = await getDirectory(data.id);
            if (!updatedDir) {
                throw new Error('No directory found');
            }
            broadcast(socket, ServerSE.UPDATE_DIRECTORY_FIELD, updatedDir, [getRoomCode(RoomType.DATA, data.id)]);
            await syncDirectoryContents(socket, updatedDir.parentId);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_DIRECTORY_CONTENTS, async (data: ClientSEPayload[ClientSE.GET_DIRECTORY_CONTENTS], reply: ClientSEReply<ClientSE.GET_DIRECTORY_CONTENTS>) => {
        try {
            if (!data) {
                throw new Error('No directory id provided');
            }
            const contents = await getDirectoryContents(data);
            reply(contents);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_DIRECTORY_CONTENTS, async (data: ClientSEPayload[ClientSE.UPDATE_DIRECTORY_CONTENTS], reply: ClientSEReply<ClientSE.UPDATE_DIRECTORY_CONTENTS>) => {
        try {
            await updateDirectoryContents(data.directoryId, data.contents);
            await syncDirectoryContents(socket, data.directoryId);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
