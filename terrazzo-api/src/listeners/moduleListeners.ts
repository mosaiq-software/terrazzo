import { ClientSE } from '@mosaiq/terrazzo-common';
import { createNewModule, getUntypedModuleById, updateModule } from '@trz-api/controllers/moduleController';
import { userCanManageModule, userCanViewModule } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerBoardListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_MODULE, async (data) => {
        if (!(await userCanViewModule(socket, data))) {
            throw new Error('User does not have permission to view this module');
        }
        const module = await getUntypedModuleById(data);
        return module;
    });

    subscribe(socket, ClientSE.CREATE_MODULE, async (data) => {
        if (!(await userCanManageModule(socket, data.parentId))) {
            throw new Error('User does not have permission to create a module in this module');
        }
        const module = await createNewModule(data.name, data.parentId, data.args.type, data.args.initialData);
        return module.id;
    });

    subscribe(socket, ClientSE.UPDATE_MODULE_FIELD, async (data) => {
        if (!(await userCanManageModule(socket, data.moduleId))) {
            throw new Error('User does not have permission to edit this module');
        }
        await updateModule(data.moduleId, data.args.type, data.args.update);
        return undefined;
    });
};
