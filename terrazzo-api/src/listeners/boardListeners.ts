import { ClientSE, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { addBoard, getBoardRes, updateBoardFromPartial } from '@trz-api/controllers/boardController';
import { syncDirectoryContents, syncParentsDirectoryContents } from '@trz-api/utils/broadcasters';
import { userCanEditModule, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerBoardListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_BOARD, async (data) => {
        if (!(await userCanViewModule(socket, data))) {
            throw new Error('User does not have permission to view this board');
        }
        const board = await getBoardRes(data);
        return board;
    });

    subscribe(socket, ClientSE.CREATE_BOARD, async (data) => {
        if (!(await userCanEditModule(socket, data.parentId))) {
            throw new Error('User does not have permission to create a board in this module');
        }
        const boardID = await addBoard(data.name, data.boardCode, data.parentId);
        await syncDirectoryContents(socket, data.parentId);
        return boardID;
    });

    subscribe(socket, ClientSE.UPDATE_BOARD_FIELD, async (data) => {
        if (!(await userCanEditModule(socket, data.id))) {
            throw new Error('User does not have permission to edit this board');
        }
        await updateBoardFromPartial(data.id, data);
        broadcast(socket, ServerSE.UPDATE_BOARD_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        await syncParentsDirectoryContents(socket, data.id);
        return undefined;
    });
};
