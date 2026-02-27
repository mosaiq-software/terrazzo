import { ClientSE } from '@mosaiq/terrazzo-common';
import { getBoardIDFromListID, moveList } from '@trz-api/controllers/listController';
import { userCanManageModule } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { Socket } from 'socket.io';

export const registerListListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.MOVE_LIST, async (data) => {
        const boardId = await getBoardIDFromListID(data.listId);
        if (!(await userCanManageModule(socket, boardId))) {
            throw new Error('Insufficient permissions to move this list');
        }
        await moveList(data.listId, data.position, boardId);
        return undefined;
    });
};
