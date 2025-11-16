import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { DirectoryHeader, DirectoryId, UID } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getDirectory = async (sockCtx: SocketContextType, directoryId: DirectoryId) => {
    return await sockCtx.emit(ClientSE.GET_DIRECTORY, directoryId);
};

export const createDirectory = async (sockCtx: SocketContextType, name: string, parentId: UID) => {
    return await sockCtx.emit(ClientSE.CREATE_DIRECTORY, { parentId, name });
};

export const updateDirectoryMetadata = async (sockCtx: SocketContextType, directoryId: DirectoryId, partial: Partial<DirectoryHeader>) => {
    await sockCtx.emit(ClientSE.UPDATE_DIRECTORY_FIELD, { ...partial, id: directoryId });
};
