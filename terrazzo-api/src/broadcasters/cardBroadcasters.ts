import { getRoomCode, ModuleId, RoomType, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketActions';

export const syncMovedCard = async (payload: ServerSEPayload[ServerSE.MOVE_CARD], onBoardId: ModuleId) => {
    await broadcast({
        event: ServerSE.MOVE_CARD,
        toRoomIds: [getRoomCode(RoomType.DATA, onBoardId)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, onBoardId))) {
                throw new Error('Insufficient permissions to view this card');
            }
            return payload;
        },
    });
};

export const syncUpdateCardAssignee = async (
    payload: ServerSEPayload[ServerSE.UPDATE_CARD_ASSIGNEE],
    onBoardId: ModuleId
) => {
    await broadcast({
        event: ServerSE.UPDATE_CARD_ASSIGNEE,
        toRoomIds: [getRoomCode(RoomType.DATA, onBoardId), getRoomCode(RoomType.USER, payload.userId)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, onBoardId))) {
                throw new Error('Insufficient permissions to view this card');
            }
            return payload;
        },
    });
};
