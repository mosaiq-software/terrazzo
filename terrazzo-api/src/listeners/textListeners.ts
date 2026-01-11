import { ClientSE } from '@mosaiq/terrazzo-common';
import { checkCanUserEditTextBlock } from '@trz-api/controllers/textBlockController';
import { getTextBlockHistorySnapshotsForTextBlockDb } from '@trz-api/persistence/textBlockHistoryPersistence';
import { getSocketData, subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerTextListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_TEXT_BLOCK_HISTORY_SNAPSHOTS, async (data) => {
        const { resourceId, resourceType } = data;
        const socketData = getSocketData(socket);
        if (!socketData.user?.userId) {
            throw new Error(`User not authenticated`);
        }
        const authorizedTextBlockId = await checkCanUserEditTextBlock(socketData.user.userId, resourceId, resourceType);
        if (!authorizedTextBlockId) {
            throw new Error(`User does not have permission to view text block history snapshots`);
        }
        const textBlockHistorySnapshots = await getTextBlockHistorySnapshotsForTextBlockDb(authorizedTextBlockId);
        return textBlockHistorySnapshots;
    });
};
