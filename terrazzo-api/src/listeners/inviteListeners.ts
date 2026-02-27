import { ClientSE } from '@mosaiq/terrazzo-common';
import { useInvite } from '@trz-api/controllers/inviteController';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerInviteListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.USE_INVITE, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        const success = await useInvite(data.inviteId, socketData.user.userId);
        return success;
    });
};
