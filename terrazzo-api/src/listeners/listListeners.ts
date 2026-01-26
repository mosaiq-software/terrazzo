import { ClientSE } from '@mosaiq/terrazzo-common';
import {
    addList,
    getBoardIDFromListID,
    getListRes,
    moveList,
    updateListFromPartial,
} from '@trz-api/controllers/listController';
import { userCanEditBoard, userCanViewBoard } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerListListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data);
        if (!(await userCanViewBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to view this list');
        }
        const list = await getListRes(data);
        if (!list) {
            throw new Error('List not found ' + data);
        }
        return list;
    });

    subscribe(socket, ClientSE.CREATE_LIST, async (data) => {
        if (!(await userCanEditBoard(socket, data.boardID))) {
            throw new Error('Insufficient permissions to create lists for this board');
        }
        const list = await addList({ boardId: data.boardID, name: data.listName });
        return list.id;
    });

    subscribe(socket, ClientSE.UPDATE_LIST_FIELD, async (data) => {
        const boardId = await getBoardIDFromListID(data.id);
        if (!(await userCanEditBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to update this list');
        }
        await updateListFromPartial(data.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.MOVE_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data.listId);
        if (!(await userCanEditBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to move this list');
        }
        await moveList(data.listId, data.position, boardId);
        return undefined;
    });
};
