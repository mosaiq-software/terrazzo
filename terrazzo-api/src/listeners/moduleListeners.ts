import { ClientSE } from '@mosaiq/terrazzo-common';
import { addBoard, updateBoardFromPartial } from '@trz-api/controllers/boardController/boardController';
import { getUntypedModuleById } from '@trz-api/controllers/moduleController';
import { userCanCreateBoard, userCanEditBoard, userCanViewBoard } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerBoardListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_MODULE, async (data) => {
        if (!(await userCanViewBoard(socket, data))) {
            throw new Error('User does not have permission to view this module');
        }
        const module = await getUntypedModuleById(data);
        return module;
    });

    subscribe(socket, ClientSE.CREATE_MODULE, async (data) => {
        if (!(await userCanCreateBoard(socket, data.parentId))) {
            throw new Error('User does not have permission to create a module in this module');
        }
        const moduleID = await addBoard(data.name, data.boardCode, data.parentId);
        return moduleID;
    });

    subscribe(socket, ClientSE.UPDATE_MODULE_FIELD, async (data) => {
        if (!(await userCanEditBoard(socket, data.id))) {
            throw new Error('User does not have permission to edit this module');
        }
        await updateBoardFromPartial(data.id, data);
        return undefined;
    });
};
