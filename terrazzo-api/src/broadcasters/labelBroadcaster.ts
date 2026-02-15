import { CardId, getRoomCode, Label, LabelId, ModuleId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncBoardLabels = async (boardId: ModuleId, labels: Label[]) => {
    await broadcast({
        event: ServerSE.UPDATE_BOARD_LABELS,
        toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, boardId))) {
                throw new Error('Insufficient permissions to view labels for this board');
            }
            return { boardId, labels };
        },
    });
};

export const syncCardLabels = async (boardId: ModuleId, cardId: CardId, labelIds: LabelId[]) => {
    await broadcast({
        event: ServerSE.UPDATE_CARDS_LABELS,
        toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, boardId))) {
                throw new Error('Insufficient permissions to view labels for this board');
            }
            return { cardId, labelIds };
        },
    });
};
