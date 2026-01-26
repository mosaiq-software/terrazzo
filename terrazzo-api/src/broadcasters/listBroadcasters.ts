import { BoardId, getRoomCode, ListHeader, ListId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { userCanViewBoard } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncAddList = async (list: ListHeader, boardId: BoardId) => {
    try {
        broadcast({
            event: ServerSE.ADD_LIST,
            toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
            buildPayload: async (userId) => {
                if (!(await userCanViewBoard(userId, boardId))) {
                    throw new Error('Insufficient permissions to view this list');
                }
                return list;
            },
        });
    } catch (error: any) {
        console.error('Error syncing add list', error);
    }
};

export const syncUpdateListField = async (listId: ListId, updates: any, boardId: BoardId) => {
    try {
        broadcast({
            event: ServerSE.UPDATE_LIST_FIELD,
            toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
            buildPayload: async (userId) => {
                if (!(await userCanViewBoard(userId, boardId))) {
                    throw new Error('Insufficient permissions to view this list');
                }
                return updates;
            },
        });
    } catch (error: any) {
        console.error('Error syncing update list field', error);
    }
};

export const syncMoveList = async (listId: ListId, position: number, boardId: BoardId) => {
    try {
        broadcast({
            event: ServerSE.MOVE_LIST,
            toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
            buildPayload: async (userId) => {
                if (!(await userCanViewBoard(userId, boardId))) {
                    throw new Error('Insufficient permissions to view this list');
                }
                return { listId, position };
            },
        });
    } catch (error: any) {
        console.error('Error syncing move list', error);
    }
};
