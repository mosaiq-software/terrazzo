import { ClientSE } from '@mosaiq/terrazzo-common';
import { executeQueryForUser } from '@trz-api/controllers/queryController';
import { getSocketData, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerQueryListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_SEARCH_RESULTS, async (data) => {
        const socketData = getSocketData(socket);
        const results = await executeQueryForUser(socketData.user.user.id, data.query, data.searchSessionId);
        return { results };
    });
};
