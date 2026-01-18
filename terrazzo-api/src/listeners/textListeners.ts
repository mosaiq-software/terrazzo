import { ClientSE } from '@mosaiq/terrazzo-common';
import {
    getTextBlockSnapshotsWithContent,
    restoreTextBlockSnapshot,
} from '@trz-api/controllers/textBlockController/historySnapshots';
import { checkCanUserEditTextBlock } from '@trz-api/controllers/textBlockController/textBlockController';
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
        const textBlockHistorySnapshots = await getTextBlockSnapshotsWithContent(authorizedTextBlockId);
        return textBlockHistorySnapshots;
    });

    subscribe(socket, ClientSE.USE_TEXT_BLOCK_HISTORY_SNAPSHOT, async (data) => {
        const { snapshotId, resourceId, resourceType } = data;
        const socketData = getSocketData(socket);
        if (!socketData.user?.userId) {
            throw new Error(`User not authenticated`);
        }
        const authorizedTextBlockId = await checkCanUserEditTextBlock(socketData.user.userId, resourceId, resourceType);
        if (!authorizedTextBlockId) {
            throw new Error(`User does not have permission to restore text block history snapshots`);
        }
        await restoreTextBlockSnapshot(snapshotId, resourceId, resourceType);
        return true;
    });
};
