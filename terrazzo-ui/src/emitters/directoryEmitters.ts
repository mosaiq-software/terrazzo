import { ClientSE, DirectoryId, UID } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

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
