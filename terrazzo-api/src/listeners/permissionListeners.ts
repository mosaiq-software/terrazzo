import { ClientSE } from '@mosaiq/terrazzo-common';
import { fetchablePermissionCheck } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerPermissionListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_CAN_PERFORM_PERMISSIBLE_ACTION, async (data) => {
        return await fetchablePermissionCheck(socket, data);
    });
};
