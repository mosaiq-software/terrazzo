import { ClientSE, getRoomCode, RoomType, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common';
import { addAssigneeToCard, removeAssigneeFromCard } from '@trz-api/controllers/cardAssignmentController';
import { addCard, duplicateCard, getBoardIDFromCardID, getSingleFullCard, moveCardToList, updateCardFromPartial } from '@trz-api/controllers/cardController';
import { getBoardIDFromListID } from '@trz-api/controllers/listController';
import { userCanEditCardsOnBoard, userCanMoveCardsOnBoard, userCanViewModule } from '@trz-api/utils/permissions';
import { broadcast, getSocketData, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerCardListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_CARD, async (data) => {
        const boardId = await getBoardIDFromCardID(data);
        if (!(await userCanViewModule(socket, boardId))) {
            throw new Error('Insufficient permissions to view this card');
        }
        const card = await getSingleFullCard(data);
        if (!card) {
            throw new Error('Card not found ' + data);
        }
        return card;
    });

    sub(socket, ClientSE.CREATE_CARD, async (data) => {
        const boardId = await getBoardIDFromListID(data.listID);
        if (!(await userCanEditCardsOnBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to create cards on this board');
        }
        const socketData = getSocketData(socket);
        const card = await addCard(data.listID, data.cardName, undefined, undefined, socketData.user.user.id);
        if (boardId) {
            broadcast(socket, ServerSE.ADD_CARD, card, [getRoomCode(RoomType.DATA, boardId)]);
        }
        return card.id;
    });

    sub(socket, ClientSE.CREATE_DUPLICATE_CARD, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanEditCardsOnBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to duplicate cards on this board');
        }
        const socketData = getSocketData(socket);
        const card = await duplicateCard(data.cardId, socketData.user.user.id);
        if (boardId) {
            broadcast(socket, ServerSE.ADD_CARD, card, [getRoomCode(RoomType.DATA, boardId)]);
        }
        return card.id;
    });

    sub(socket, ClientSE.UPDATE_CARD_FIELD, async (data) => {
        const boardId = await getBoardIDFromCardID(data.id);
        if (!(await userCanEditCardsOnBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to update this card');
        }
        await updateCardFromPartial(data.id, data);
        if (boardId) {
            broadcast(socket, ServerSE.UPDATE_CARD_FIELD, data, [getRoomCode(RoomType.DATA, boardId)]);
        }
        return undefined;
    });

    sub(socket, ClientSE.MOVE_CARD, async (data) => {
        const boardId = await getBoardIDFromListID(data.toList);
        if (!(await userCanMoveCardsOnBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to move cards on this board');
        }
        await moveCardToList(data.cardId, data.toList, data.position);
        const payload: ServerSEPayload[ServerSE.MOVE_CARD] = { ...data };
        if (boardId) {
            broadcast(socket, ServerSE.MOVE_CARD, payload, [getRoomCode(RoomType.DATA, boardId)], false);
        }
        return undefined;
    });

    sub(socket, ClientSE.UPDATE_CARD_ASSIGNEE, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanEditCardsOnBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to update assignees for this card');
        }

        if (data.assigned) {
            await addAssigneeToCard(data.cardId, data.userId);
        } else {
            await removeAssigneeFromCard(data.cardId, data.userId);
        }

        const payload: ServerSEPayload[ServerSE.UPDATE_CARD_ASSIGNEE] = data;
        broadcast(socket, ServerSE.UPDATE_CARD_ASSIGNEE, payload, [getRoomCode(RoomType.DATA, boardId)]);
        broadcast(socket, ServerSE.UPDATE_CARD_ASSIGNEE, payload, [getRoomCode(RoomType.USER, data.userId)]);
        return undefined;
    });
};
