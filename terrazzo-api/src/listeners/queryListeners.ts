import { ClientSE } from '@mosaiq/terrazzo-common';
import { executeQueryForUser } from '@trz-api/controllers/queryController';
import { getSocketData, subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerQueryListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_SEARCH_RESULTS, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData.user?.userId) {
            throw new Error('User not authenticated');
        }
        const results = await executeQueryForUser(socketData.user.userId, data.query, data.searchSessionId);
        return { results };
    });
};
