import { BoardId, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getBoardHeader } from '@trz-api/controllers/boardController';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server } from 'socket.io';

export const syncBoardFields = async (io: Server, boardId: BoardId) => {
    const boardHeader = await getBoardHeader(boardId);
    if (!boardHeader) {
        throw new Error('No board found');
    }
    broadcast({
        io,
        event: ServerSE.UPDATE_BOARD_FIELD,
        toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
        buildPayload: async (userId) => {
            if (!(await userCanViewModule(userId, boardId))) {
                throw new Error('User does not have permission to view this board');
            }
            return boardHeader;
        },
    });
};
