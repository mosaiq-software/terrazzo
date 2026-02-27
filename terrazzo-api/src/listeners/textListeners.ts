import { ClientSE } from '@mosaiq/terrazzo-common';
import { restoreTextBlockSnapshot } from '@trz-api/controllers/textBlockController/historySnapshots';
import { checkCanUserEditTextBlock } from '@trz-api/controllers/textBlockController/textBlockController';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerTextListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.USE_TEXT_BLOCK_HISTORY_SNAPSHOT, async (data) => {
        const { snapshotId, resourceId, resourceType } = data;
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
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
