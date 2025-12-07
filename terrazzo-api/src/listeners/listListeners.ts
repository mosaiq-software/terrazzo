import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncAddList, syncMoveList, syncUpdateListField } from '@trz-api/broadcasters';
import { addList, getBoardIDFromListID, getListRes, moveList, updateListFromPartial } from '@trz-api/controllers/listController';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerListListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_LIST, async (data) => {
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

    subscribe(socket, ClientSE.CREATE_LIST, async (data) => {
        if (!(await userCanEditModule(socket, data.boardID))) {
            throw new Error('Insufficient permissions to create lists for this board');
        }
        const list = await addList(data.boardID, data.listName);
        await syncAddList(io, list, data.boardID);
        return list.id;
    });

    subscribe(socket, ClientSE.UPDATE_LIST_FIELD, async (data) => {
        const boardId = await getBoardIDFromListID(data.id);
        if (!(await userCanEditModule(socket, boardId))) {
            throw new Error('Insufficient permissions to update this list');
        }
        await updateListFromPartial(data.id, data);
        if (boardId) {
            await syncUpdateListField(io, data.id, data, boardId);
        }
        return undefined;
    });

    subscribe(socket, ClientSE.MOVE_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data.listId);
        if (!(await userCanEditModule(socket, boardId))) {
            throw new Error('Insufficient permissions to move this list');
        }
        await moveList(data.listId, data.position);
        if (boardId) {
            await syncMoveList(io, data.listId, data.position, boardId);
        }
        return undefined;
    });
};
