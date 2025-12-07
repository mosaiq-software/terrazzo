import { BoardId, ClientSE, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createBoardLabel, removeBoardLabel, updateBoardLabels } from '@trz-api/controllers/boardController';
import { getBoardIDFromCardID, setCardsLabels } from '@trz-api/controllers/cardController';
import { userCanEditModule } from '@trz-api/utils/permissions';
import { broadcast, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerLabelListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.CREATE_BOARD_LABEL, async (data) => {
        if (!(await userCanEditModule(socket, data.boardId))) {
            throw new Error('Insufficient permissions to create labels for this board');
        }
        const boardId: BoardId = data.boardId;
        const labels = await createBoardLabel(boardId, data.name, data.color);
        broadcast(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
        return undefined;
    });

    sub(socket, ClientSE.UPDATE_BOARD_LABEL, async (data) => {
        if (!(await userCanEditModule(socket, data.boardId))) {
            throw new Error('Insufficient permissions to update labels for this board');
        }
        const boardId: BoardId = data.boardId;
        const labels = await updateBoardLabels(boardId, data.label);
        broadcast(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
        return undefined;
    });

    sub(socket, ClientSE.DELETE_BOARD_LABEL, async (data) => {
        if (!(await userCanEditModule(socket, data.boardId))) {
            throw new Error('Insufficient permissions to delete labels for this board');
        }
        const boardId: BoardId = data.boardId;
        const labels = await removeBoardLabel(boardId, data.labelId);
        broadcast(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
        return undefined;
    });

    sub(socket, ClientSE.UPDATE_CARDS_LABELS, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanEditModule(socket, boardId))) {
            throw new Error('Insufficient permissions to update labels for cards on this board');
        }
        await setCardsLabels(data.cardId, data.labelIds);
        if (boardId) {
            broadcast(socket, ServerSE.UPDATE_CARDS_LABELS, data, [getRoomCode(RoomType.DATA, boardId)]);
        }
        return undefined;
    });
};
