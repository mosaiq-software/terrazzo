import { BoardId, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getBoardHeader } from '@trz-api/controllers/boardController';
import { userCanViewBoard } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncBoardFields = async (boardId: BoardId) => {
    const boardHeader = await getBoardHeader(boardId);
    if (!boardHeader) {
        throw new Error('No board found');
    }
    broadcast({
        event: ServerSE.UPDATE_BOARD_FIELD,
        toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
        buildPayload: async (userId) => {
            if (!(await userCanViewBoard(userId, boardId))) {
                throw new Error('User does not have permission to view this board');
            }
            return boardHeader;
        },
    });
};
