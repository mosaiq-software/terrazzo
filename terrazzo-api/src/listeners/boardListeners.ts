import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { getBoardRes, addBoard, updateBoardFromPartial } from '@trz-api/controllers/boardController';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerBoardListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_BOARD, async (data: ClientSEPayload[ClientSE.GET_BOARD], reply: ClientSEReply<ClientSE.GET_BOARD>) => {
        try {
            if (!data) {
                throw new Error('No board id provided');
            }
            const board = await getBoardRes(data);
            reply(board);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_BOARD, async (data: ClientSEPayload[ClientSE.CREATE_BOARD], reply: ClientSEReply<ClientSE.CREATE_BOARD>) => {
        try {
            if (!data) {
                throw new Error('No board data provided');
            }
            const boardID = await addBoard(data.name, data.boardCode, data.projectId);
            reply(boardID);
        } catch (error: any) {
            console.error('Error creating board', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_BOARD_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_BOARD_FIELD], reply: ClientSEReply<ClientSE.UPDATE_BOARD_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No board data provided');
            }
            await updateBoardFromPartial(data.id, data);
            broadcast<ServerSE.UPDATE_BOARD_FIELD>(socket, ServerSE.UPDATE_BOARD_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        } catch (error: any) {
            console.error('Error updating board fields', error);
            reply(undefined, error.message);
        }
    });
};
