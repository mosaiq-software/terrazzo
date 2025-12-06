import { BoardId, ClientSE, ClientSEPayload, ClientSEReply, getRoomCode, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createBoardLabel, removeBoardLabel, updateBoardLabels } from '@trz-api/controllers/boardController';
import { getBoardIDFromCardID, setCardsLabels } from '@trz-api/controllers/cardController';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerLabelListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.CREATE_BOARD_LABEL, async (data: ClientSEPayload[ClientSE.CREATE_BOARD_LABEL], reply: ClientSEReply<ClientSE.CREATE_BOARD_LABEL>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const boardId: BoardId = data.boardId;
            const labels = await createBoardLabel(boardId, data.name, data.color);
            broadcast<ServerSE.UPDATE_BOARD_LABELS>(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
            reply(undefined);
        } catch (error: any) {
            console.error('Error creating board label', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_BOARD_LABEL, async (data: ClientSEPayload[ClientSE.UPDATE_BOARD_LABEL], reply: ClientSEReply<ClientSE.UPDATE_BOARD_LABEL>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const boardId: BoardId = data.boardId;
            const labels = await updateBoardLabels(boardId, data.label);
            broadcast<ServerSE.UPDATE_BOARD_LABELS>(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating board labels', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.DELETE_BOARD_LABEL, async (data: ClientSEPayload[ClientSE.DELETE_BOARD_LABEL], reply: ClientSEReply<ClientSE.DELETE_BOARD_LABEL>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const boardId: BoardId = data.boardId;
            const labels = await removeBoardLabel(boardId, data.labelId);
            broadcast<ServerSE.UPDATE_BOARD_LABELS>(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
            reply(undefined);
        } catch (error: any) {
            console.error('Error deleting board labels', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_CARDS_LABELS, async (data: ClientSEPayload[ClientSE.UPDATE_CARDS_LABELS], reply: ClientSEReply<ClientSE.UPDATE_CARDS_LABELS>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await setCardsLabels(data.cardId, data.labelIds);
            const boardId = await getBoardIDFromCardID(data.cardId);
            if (boardId) {
                broadcast<ServerSE.UPDATE_CARDS_LABELS>(socket, ServerSE.UPDATE_CARDS_LABELS, data, [getRoomCode(RoomType.DATA, boardId)]);
            }
            reply(undefined);
        } catch (error: any) {
            console.error('Error deleting board labels', error);
            reply(undefined, error.message);
        }
    });
};
