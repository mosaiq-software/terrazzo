import { BoardId, getRoomCode, List, ListId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server } from 'socket.io';

export const syncAddList = async (io: Server, list: List, boardId: BoardId) => {
    try {
        broadcast({
            io,
            event: ServerSE.ADD_LIST,
            toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
            buildPayload: async (userId) => {
                if (!(await userCanViewModule(userId, boardId))) {
                    throw new Error('Insufficient permissions to view this list');
                }
                return list;
            },
        });
    } catch (error: any) {
        console.error('Error syncing add list', error);
    }
};

export const syncUpdateListField = async (io: Server, listId: ListId, updates: any, boardId: BoardId) => {
    try {
        broadcast({
            io,
            event: ServerSE.UPDATE_LIST_FIELD,
            toRoomIds: [getRoomCode(RoomType.DATA, boardId)],
            buildPayload: async (userId) => {
                if (!(await userCanViewModule(userId, boardId))) {
                    throw new Error('Insufficient permissions to view this list');
                }
                return updates;
            },
        });
    } catch (error: any) {
        console.error('Error syncing update list field', error);
    }
};

export const syncMoveList = async (io: Server, listId: ListId, position: number, boardId: BoardId) => {
    try {
        broadcast({
            io,
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
