import { getRoomCode, RoomType, ServerSE, TextBlockId, TextBlockResourceType, UID } from '@mosaiq/terrazzo-common';
import {
    checkCanUserEditTextBlock,
    getTextBlockSnapshotsWithContent,
} from '@trz-api/controllers/textBlockController/textBlockController';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncTextHistorySnapshots = async (
    textBlockId: TextBlockId,
    resourceId: UID,
    resourceType: TextBlockResourceType
) => {
    try {
        const snapshots = await getTextBlockSnapshotsWithContent(textBlockId);
        broadcast({
            event: ServerSE.UPDATE_TEXT_BLOCK_HISTORY_SNAPSHOTS,
            toRoomIds: [getRoomCode(RoomType.DATA, textBlockId)],
            buildPayload: async (userId) => {
                if (!(await checkCanUserEditTextBlock(userId, resourceId, resourceType))) {
                    throw new Error('Insufficient permissions to view this organization');
                }
                return {
                    textBlockId,
                    snapshots,
                };
            },
        });
    } catch (error: any) {
        console.error('Error syncing update org field', error);
    }
};
