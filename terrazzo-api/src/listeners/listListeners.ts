import { ClientSE } from '@mosaiq/terrazzo-common';
import { listHandler } from '@trz-api/controllers/dataSources/objectHandlers/list';
import { getBoardIDFromListID, moveList } from '@trz-api/controllers/listController';
import { userCanManageModule, userCanViewModule } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { Socket } from 'socket.io';

export const registerListListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data);
        if (!(await userCanViewModule(socket, boardId))) {
            throw new Error('Insufficient permissions to view this list');
        }
        const list = await listHandler.read(data);
        if (!list) {
            throw new Error('List not found ' + data);
        }
        return list;
    });

    subscribe(socket, ClientSE.CREATE_LIST, async (data) => {
        if (!(await userCanManageModule(socket, data.boardID))) {
            throw new Error('Insufficient permissions to create lists for this board');
        }
        return await listHandler.create({ boardId: data.boardID, name: data.listName });
    });

    subscribe(socket, ClientSE.UPDATE_LIST_FIELD, async (data) => {
        const boardId = await getBoardIDFromListID(data.id);
        if (!(await userCanManageModule(socket, boardId))) {
            throw new Error('Insufficient permissions to update this list');
        }
        await listHandler.update(data.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.MOVE_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data.listId);
        if (!(await userCanManageModule(socket, boardId))) {
            throw new Error('Insufficient permissions to move this list');
        }
        await moveList(data.listId, data.position, boardId);
        return undefined;
    });
};
