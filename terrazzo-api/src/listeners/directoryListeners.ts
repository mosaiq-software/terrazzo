import { ClientSE, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createDirectory, getDirectory, getDirectoryContents, updateDirectory, updateDirectoryContents } from '@trz-api/controllers/directoryController';
import { syncDirectoryContents } from '@trz-api/utils/broadcasters';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDirectoryListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_DIRECTORY, async (data) => {
        if (!(await userCanViewModule(socket, data))) {
            throw new Error('User does not have permission to view this directory');
        }
        const directoryHeader = await getDirectory(data);
        return directoryHeader;
    });

    subscribe(socket, ClientSE.CREATE_DIRECTORY, async (data) => {
        if (!(await userCanEditModule(socket, data.parentId))) {
            throw new Error('User does not have permission to create a directory in this module');
        }
        const directoryHeader = await createDirectory(data.name, data.parentId);
        await syncDirectoryContents(socket, directoryHeader.parentId);
        return directoryHeader;
    });

    subscribe(socket, ClientSE.UPDATE_DIRECTORY_FIELD, async (data) => {
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
        return undefined;
    });

    subscribe(socket, ClientSE.GET_DIRECTORY_CONTENTS, async (data) => {
        const contents = await getDirectoryContents(data);
        return contents;
    });

    subscribe(socket, ClientSE.UPDATE_DIRECTORY_CONTENTS, async (data) => {
        await updateDirectoryContents(data.directoryId, data.contents);
        await syncDirectoryContents(socket, data.directoryId);
        return undefined;
    });
};
