import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncDirectoryContents, syncDirectoryField } from '@trz-api/broadcasters';
import { createDirectory, getDirectory, getDirectoryContentsForUser, updateDirectory, updateDirectoryContents } from '@trz-api/controllers/directoryController';
import { userCanCreateDirectory, userCanEditDirectory, userCanViewDirectory } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerDirectoryListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_DIRECTORY, async (data) => {
        if (!(await userCanViewDirectory(socket, data))) {
            throw new Error('User does not have permission to view this directory');
        }
        const directoryHeader = await getDirectory(data);
        return directoryHeader;
    });

    subscribe(socket, ClientSE.CREATE_DIRECTORY, async (data) => {
        if (!(await userCanCreateDirectory(socket, data.parentId))) {
            throw new Error('User does not have permission to create a directory in this module');
        }
        const directoryHeader = await createDirectory(data.name, data.parentId);
        await syncDirectoryContents(io, directoryHeader.parentId);
        return directoryHeader;
    });

    subscribe(socket, ClientSE.UPDATE_DIRECTORY_FIELD, async (data) => {
        if (!(await userCanEditDirectory(socket, data.id))) {
            throw new Error('User does not have permission to edit this directory');
        }
        await updateDirectory(data.id, data);
        const updatedDir = await getDirectory(data.id);
        if (!updatedDir) {
            throw new Error('No directory found');
        }
        await syncDirectoryField(io, updatedDir);
        await syncDirectoryContents(io, updatedDir.parentId);
        return undefined;
    });

    subscribe(socket, ClientSE.GET_DIRECTORY_CONTENTS, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData.user?.user.id) {
            return [];
        }
        const contents = await getDirectoryContentsForUser(data, socketData.user.user.id);
        return contents;
    });

    subscribe(socket, ClientSE.UPDATE_DIRECTORY_CONTENTS, async (data) => {
        await updateDirectoryContents(data.directoryId, data.contents);
        await syncDirectoryContents(io, data.directoryId);
        return undefined;
    });
};
