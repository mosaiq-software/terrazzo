import { BoardId, CardId, getRoomCode, Label, LabelId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server } from 'socket.io';

export const syncBoardLabels = async (io: Server, boardId: BoardId, labels: Label[]) => {
    await broadcast({
        io,
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

export const syncCardLabels = async (io: Server, boardId: BoardId, cardId: CardId, labelIds: LabelId[]) => {
    await broadcast({
        io,
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
