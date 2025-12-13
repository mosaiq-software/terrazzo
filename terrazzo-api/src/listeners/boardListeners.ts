import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncBoardFields, syncDirectoryContents, syncParentsDirectoryContents } from '@trz-api/broadcasters';
import { addBoard, getBoardRes, updateBoardFromPartial } from '@trz-api/controllers/boardController';
import { userCanCreateBoard, userCanEditBoard, userCanViewBoard } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerBoardListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_BOARD, async (data) => {
        if (!(await userCanViewBoard(socket, data))) {
            throw new Error('User does not have permission to view this board');
        }
        const board = await getBoardRes(data);
        return board;
    });

    subscribe(socket, ClientSE.CREATE_BOARD, async (data) => {
        if (!(await userCanCreateBoard(socket, data.parentId))) {
            throw new Error('User does not have permission to create a board in this module');
        }
        const boardID = await addBoard(data.name, data.boardCode, data.parentId);
        await syncDirectoryContents(io, data.parentId);
        return boardID;
    });

    subscribe(socket, ClientSE.UPDATE_BOARD_FIELD, async (data) => {
        if (!(await userCanEditBoard(socket, data.id))) {
            throw new Error('User does not have permission to edit this board');
        }
        await updateBoardFromPartial(data.id, data);
        await syncBoardFields(io, data.id);
        await syncParentsDirectoryContents(io, data.id);
        return undefined;
    });
};
