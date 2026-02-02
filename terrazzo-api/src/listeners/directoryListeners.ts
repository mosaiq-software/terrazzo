import { ClientSE } from '@mosaiq/terrazzo-common';
import {
    createDirectory,
    getDirectory,
    getDirectoryContentsForUser,
    updateDirectory,
    updateDirectoryContents,
} from '@trz-api/controllers/directoryController';
import { userCanCreateDirectory, userCanEditDirectory, userCanViewDirectory } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerDirectoryListeners = (socket: Socket) => {
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
        return directoryHeader;
    });

    subscribe(socket, ClientSE.UPDATE_DIRECTORY_FIELD, async (data) => {
        if (!(await userCanEditDirectory(socket, data.id))) {
            throw new Error('User does not have permission to edit this directory');
        }
        await updateDirectory(data.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.GET_DIRECTORY_CONTENTS, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            return [];
        }
        const contents = await getDirectoryContentsForUser(data, socketData.user.userId);
        return contents;
    });

    subscribe(socket, ClientSE.UPDATE_DIRECTORY_CONTENTS, async (data) => {
        await updateDirectoryContents(data.directoryId, data.contents);
        return undefined;
    });
};
