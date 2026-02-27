import { getRoomCode, ListId, ModuleId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketActions';

export const syncMoveList = async (listId: ListId, position: number | null, boardId: ModuleId) => {
    try {
        broadcast({
            event: ServerSE.MOVE_LIST,
            toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
            buildPayload: async (userId) => {
                if (!(await userCanViewModule(userId, boardId))) {
                    throw new Error('Insufficient permissions to view this list');
                }
                return { listId, position };
            },
        });
    } catch (error: any) {
        console.error('Error syncing move list', error);
    }
};
