import { BoardId, ClientSE } from '@mosaiq/terrazzo-common';
import {
    createBoardLabel,
    removeBoardLabel,
    updateBoardLabels,
} from '@trz-api/controllers/boardController/boardController';
import { getBoardIDFromCardID, setCardsLabels } from '@trz-api/controllers/cardController';
import { userCanEditBoard, userCanEditCard } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerLabelListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.CREATE_BOARD_LABEL, async (data) => {
        if (!(await userCanEditBoard(socket, data.boardId))) {
            throw new Error('Insufficient permissions to create labels for this board');
        }
        const newLabelId = await createBoardLabel(data.boardId, data.name, data.color);
        return newLabelId;
    });

    subscribe(socket, ClientSE.UPDATE_BOARD_LABEL, async (data) => {
        if (!(await userCanEditBoard(socket, data.boardId))) {
            throw new Error('Insufficient permissions to update labels for this board');
        }
        const boardId: BoardId = data.boardId;
        await updateBoardLabels(boardId, data.label);
        return undefined;
    });

    subscribe(socket, ClientSE.DELETE_BOARD_LABEL, async (data) => {
        if (!(await userCanEditBoard(socket, data.boardId))) {
            throw new Error('Insufficient permissions to delete labels for this board');
        }
        const boardId: BoardId = data.boardId;
        await removeBoardLabel(boardId, data.labelId);
        return undefined;
    });

    subscribe(socket, ClientSE.UPDATE_CARDS_LABELS, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanEditCard(socket, boardId))) {
            throw new Error('Insufficient permissions to update labels for cards on this board');
        }
        await setCardsLabels(data.cardId, data.labelIds);
        return undefined;
    });
};
