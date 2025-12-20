import { ClientSE } from '@mosaiq/terrazzo-common';
import { addBoard, getBoardRes, updateBoardFromPartial } from '@trz-api/controllers/boardController';
import { userCanCreateBoard, userCanEditBoard, userCanViewBoard } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerBoardListeners = (socket: Socket) => {
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
        return boardID;
    });

    subscribe(socket, ClientSE.UPDATE_BOARD_FIELD, async (data) => {
        if (!(await userCanEditBoard(socket, data.id))) {
            throw new Error('User does not have permission to edit this board');
        }
        await updateBoardFromPartial(data.id, data);
        return undefined;
    });
};
