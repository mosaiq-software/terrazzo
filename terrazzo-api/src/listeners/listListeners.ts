import { ClientSE, getRoomCode, RoomType, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common';
import { addList, getBoardIDFromListID, getListRes, moveList, updateListFromPartial } from '@trz-api/controllers/listController';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerListListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data);
        if (!(await userCanViewModule(socket, boardId))) {
            throw new Error('Insufficient permissions to view this list');
        }
        const list = await getListRes(data);
        if (!list) {
            throw new Error('List not found ' + data);
        }
        return list;
    });

    sub(socket, ClientSE.CREATE_LIST, async (data) => {
        if (!(await userCanEditModule(socket, data.boardID))) {
            throw new Error('Insufficient permissions to create lists for this board');
        }
        const list = await addList(data.boardID, data.listName);
        broadcast(socket, ServerSE.ADD_LIST, list, [getRoomCode(RoomType.DATA, data.boardID)]);
        return list.id;
    });

    sub(socket, ClientSE.UPDATE_LIST_FIELD, async (data) => {
        const boardId = await getBoardIDFromListID(data.id);
        if (!(await userCanEditModule(socket, boardId))) {
            throw new Error('Insufficient permissions to update this list');
        }
        await updateListFromPartial(data.id, data);
        if (boardId) {
            broadcast(socket, ServerSE.UPDATE_LIST_FIELD, data, [getRoomCode(RoomType.DATA, boardId)]);
        }
        return undefined;
    });

    sub(socket, ClientSE.MOVE_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data.listId);
        if (!(await userCanEditModule(socket, boardId))) {
            throw new Error('Insufficient permissions to move this list');
        }
        await moveList(data.listId, data.position);
        const payload: ServerSEPayload[ServerSE.MOVE_LIST] = { listId: data.listId, position: data.position };
        if (boardId) {
            broadcast(socket, ServerSE.MOVE_LIST, payload, [getRoomCode(RoomType.DATA, boardId)], false);
        }
        return undefined;
    });
};
