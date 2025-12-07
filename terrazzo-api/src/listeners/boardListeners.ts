import { ClientSE, ClientSEPayload, ClientSEReply, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { addBoard, getBoardRes, updateBoardFromPartial } from '@trz-api/controllers/boardController';
import { syncDirectoryContents, syncParentsDirectoryContents } from '@trz-api/utils/broadcasters';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerBoardListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_BOARD, async (data: ClientSEPayload[ClientSE.GET_BOARD], reply: ClientSEReply<ClientSE.GET_BOARD>) => {
        try {
            if (!data) {
                throw new Error('No board id provided');
            }
            if (!(await userCanViewModule(socket, data))) {
                throw new Error('User does not have permission to view this board');
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
            if (!(await userCanEditModule(socket, data.parentId))) {
                throw new Error('User does not have permission to create a board in this module');
            }
            const boardID = await addBoard(data.name, data.boardCode, data.parentId);
            await syncDirectoryContents(socket, data.parentId);
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
            if (!(await userCanEditModule(socket, data.id))) {
                throw new Error('User does not have permission to edit this board');
            }
            await updateBoardFromPartial(data.id, data);
            broadcast(socket, ServerSE.UPDATE_BOARD_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
            await syncParentsDirectoryContents(socket, data.id);
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating board fields', error);
            reply(undefined, error.message);
        }
    });
};
