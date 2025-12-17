import { DirectoryHeader, DirectoryId, getRoomCode, RoomSpecifier, RoomType, ServerSE, UID } from '@mosaiq/terrazzo-common';
import { getDirectoryContentsForUser } from '@trz-api/controllers/directoryController';
import { getModuleById } from '@trz-api/controllers/moduleController';
import { userCanViewDirectory } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server } from 'socket.io';

export const syncParentsDirectoryContents = async (io: Server, childId: UID) => {
    try {
        const childModule = await getModuleById(childId);
        if (!childModule) {
            throw new Error('Child module not found for syncing parent directory contents');
        }
        const parentId = childModule.parentId;
        if (!parentId) {
            throw new Error('No parentId found for child module when syncing parent directory contents');
        }
        await syncDirectoryContents(io, parentId);
    } catch (error: any) {
        console.error('Error syncing parents directory contents', error);
    }
};

export const syncDirectoryContents = async (io: Server, dirId: DirectoryId) => {
    try {
        broadcast({
            io,
            event: ServerSE.UPDATE_DIRECTORY_CONTENTS,
            toRoomIds: [getRoomCode(RoomType.DATA, dirId, RoomSpecifier.CONTENTS)],
            buildPayload: async (userId) => {
                if (!(await userCanViewDirectory(userId, dirId))) {
                    throw new Error('Insufficient permissions to view this directory');
                }
                if (!userId) {
                    throw new Error('No userId provided for syncing directory contents');
                }
                const directoryContents = await getDirectoryContentsForUser(dirId, userId);
                return { directoryId: dirId, contents: directoryContents };
            },
        });
    } catch (error: any) {
        console.error('Error syncing directory contents', error);
    }
};

export const syncDirectoryField = async (io: Server, directory: DirectoryHeader) => {
    await broadcast({
        io,
        event: ServerSE.UPDATE_DIRECTORY_FIELD,
        toRoomIds: [getRoomCode(RoomType.DATA, directory.id)],
        buildPayload: async (userId) => {
            if (!(await userCanViewDirectory(userId, directory.id))) {
                throw new Error('Insufficient permissions to view this directory');
            }
            return directory;
        },
    });
};
