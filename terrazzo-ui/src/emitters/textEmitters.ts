import { ClientSE, TextBlockResourceType, UID } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getTextBlockHistorySnapshots = async (
    sockCtx: SocketContextType,
    resourceId: UID,
    resourceType: TextBlockResourceType
) => {
    return await sockCtx.emit(ClientSE.GET_TEXT_BLOCK_HISTORY_SNAPSHOTS, { resourceId, resourceType });
};

export const restoreTextBlockSnapshot = (
    sockCtx: SocketContextType,
    snapshotId: UID,
    resourceId: UID,
    resourceType: TextBlockResourceType
) => {
    return sockCtx.emit(ClientSE.USE_TEXT_BLOCK_HISTORY_SNAPSHOT, {
        snapshotId,
        resourceId,
        resourceType,
    });
};
