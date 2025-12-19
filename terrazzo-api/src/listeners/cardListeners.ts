import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncAddCard, syncMovedCard, syncUpdateCardAssignee, syncUpdateCardField } from '@trz-api/broadcasters';
import { addAssigneeToCard, removeAssigneeFromCard } from '@trz-api/controllers/cardAssignmentController';
import { addCard, duplicateCard, getBoardIDFromCardID, getSingleFullCard, moveCardToList, updateCardFromPartial } from '@trz-api/controllers/cardController';
import { getBoardIDFromListID } from '@trz-api/controllers/listController';
import { userCanEditCard, userCanMoveCardsOnBoard, userCanViewBoard } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerCardListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_CARD, async (data) => {
        const boardId = await getBoardIDFromCardID(data);
        if (!(await userCanViewBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to view this card');
        }
        const card = await getSingleFullCard(data);
        if (!card) {
            throw new Error('Card not found ' + data);
        }
        return card;
    });

    subscribe(socket, ClientSE.CREATE_CARD, async (data) => {
        const boardId = await getBoardIDFromListID(data.listID);
        if (!(await userCanEditCard(socket, boardId))) {
            throw new Error('Insufficient permissions to create cards on this board');
        }
        const socketData = getSocketData(socket);
        if (!socketData.user?.user.id) {
            throw new Error('User not authenticated');
        }
        const card = await addCard(data.listID, data.cardName, undefined, undefined, socketData.user.user.id);
        await syncAddCard(io, card, boardId);
        return card.id;
    });

    subscribe(socket, ClientSE.CREATE_DUPLICATE_CARD, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanEditCard(socket, boardId))) {
            throw new Error('Insufficient permissions to duplicate cards on this board');
        }
        const socketData = getSocketData(socket);
        if (!socketData.user?.user.id) {
            throw new Error('User not authenticated');
        }
        const card = await duplicateCard(data.cardId, socketData.user.user.id);
        await syncAddCard(io, card, boardId);
        return card.id;
    });

    subscribe(socket, ClientSE.UPDATE_CARD_FIELD, async (data) => {
        const boardId = await getBoardIDFromCardID(data.id);
        if (!(await userCanEditCard(socket, boardId))) {
            throw new Error('Insufficient permissions to update this card');
        }
        await updateCardFromPartial(data.id, data);
        await syncUpdateCardField(io, data, boardId);
        return undefined;
    });

    subscribe(socket, ClientSE.MOVE_CARD, async (data) => {
        const boardId = await getBoardIDFromListID(data.toList);
        if (!(await userCanMoveCardsOnBoard(socket, boardId))) {
            throw new Error('Insufficient permissions to move cards on this board');
        }
        await moveCardToList(data.cardId, data.toList, data.position);
        await syncMovedCard(io, data, boardId);
        return undefined;
    });

    subscribe(socket, ClientSE.UPDATE_CARD_ASSIGNEE, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanEditCard(socket, boardId))) {
            throw new Error('Insufficient permissions to update assignees for this card');
        }

        if (data.assigned) {
            await addAssigneeToCard(data.cardId, data.userId);
        } else {
            await removeAssigneeFromCard(data.cardId, data.userId);
        }
        await syncUpdateCardAssignee(io, data, boardId);
        return undefined;
    });
};
