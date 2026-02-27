import { ClientSE } from '@mosaiq/terrazzo-common';
import { endAuthenticatedSession } from '@trz-api/controllers/authController';
import { getUserHeaderByUsernameDb } from '@trz-api/persistence/userPersistence';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerUserListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.LOGOUT, async () => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            return undefined;
        }
        await endAuthenticatedSession(socketData.user.userId);
        return undefined;
    });

    subscribe(socket, ClientSE.GET_USERNAME_AVAILABLE, async (data) => {
        const userWithUsername = await getUserHeaderByUsernameDb(data);
        const socketData = getSocketData(socket);
        if (userWithUsername && userWithUsername.id !== socketData?.user?.userId) {
            return false;
        }
        return true;
    });
};
