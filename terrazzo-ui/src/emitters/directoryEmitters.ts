import { ClientSE, DirectoryHeader, DirectoryId, UID } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getDirectory = async (
    sockCtx: SocketContextType,
    directoryId: DirectoryId
): Promise<DirectoryHeader | undefined> => {
    return await sockCtx.emit(ClientSE.GET_DIRECTORY, directoryId);
};
export const createDirectory = async (sockCtx: SocketContextType, name: string, parentId: UID) => {
    return await sockCtx.emit(ClientSE.CREATE_DIRECTORY, { parentId, name });
};

export const updateDirectoryMetadata = async (
    sockCtx: SocketContextType,
    directoryId: DirectoryId,
    partial: Partial<DirectoryHeader>
) => {
    await sockCtx.emit(ClientSE.UPDATE_DIRECTORY_FIELD, { ...partial, id: directoryId });
};

export const getDirectoryContents = async (sockCtx: SocketContextType, directoryId: DirectoryId) => {
    return await sockCtx.emit(ClientSE.GET_DIRECTORY_CONTENTS, directoryId);
};

export const updateDirectoryContents = async (
    sockCtx: SocketContextType,
    directoryId: DirectoryId,
    contents: UID[]
) => {
    await sockCtx.emit(ClientSE.UPDATE_DIRECTORY_CONTENTS, { directoryId, contents });
};
