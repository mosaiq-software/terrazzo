import { ClientSE, ClientSEPayload, ClientSEReply } from '@mosaiq/terrazzo-common/socketTypes';
import { executeQueryForUser } from '@trz-api/controllers/queryController';
import { getSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerQueryListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_SEARCH_RESULTS, async (data: ClientSEPayload[ClientSE.GET_SEARCH_RESULTS], reply: ClientSEReply<ClientSE.GET_SEARCH_RESULTS>) => {
        try {
            const socketData = getSocketData(socket);
            const results = await executeQueryForUser(socketData.user.user.id, data.query, data.searchSessionId);
            reply({ results });
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
