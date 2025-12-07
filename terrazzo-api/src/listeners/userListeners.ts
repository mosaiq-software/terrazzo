import { ClientSE } from '@mosaiq/terrazzo-common';
import { getUserPreview } from '@trz-api/controllers/userController';
import { sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerUserListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_USER, async (data) => {
        const userHeader = await getUserPreview(data);
        return userHeader;
    });
};
