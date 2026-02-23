import { ClientSE } from '@mosaiq/terrazzo-common';
import { addAssigneeToCard, removeAssigneeFromCard } from '@trz-api/controllers/cardAssignmentController';
import {
    addCard,
    duplicateCard,
    getBoardIDFromCardID,
    getCard,
    moveCard,
    updateCardFromPartial,
} from '@trz-api/controllers/cardController';
import { getBoardIDFromListID } from '@trz-api/controllers/listController';
import { userCanManageCards, userCanViewModule } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerCardListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_CARD, async (data) => {
        const boardId = await getBoardIDFromCardID(data);
        if (!(await userCanViewModule(socket, boardId))) {
            throw new Error('Insufficient permissions to view this card');
        }
        const card = await getCard(data);
        if (!card) {
            throw new Error('Card not found ' + data);
        }
        return card;
    });

    subscribe(socket, ClientSE.CREATE_CARD, async (data) => {
        const boardId = await getBoardIDFromListID(data.listID);
        if (!(await userCanManageCards(socket, boardId))) {
            throw new Error('Insufficient permissions to create cards on this board');
        }
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        const card = await addCard({
            listId: data.listID,
            name: data.cardName,
            createdById: socketData.user.userId,
        });
        return card.id;
    });

    subscribe(socket, ClientSE.CREATE_DUPLICATE_CARD, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanManageCards(socket, boardId))) {
            throw new Error('Insufficient permissions to duplicate cards on this board');
        }
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        const card = await duplicateCard(data.cardId, socketData.user.userId);
        return card.id;
    });

    subscribe(socket, ClientSE.UPDATE_CARD_FIELD, async (data) => {
        const boardId = await getBoardIDFromCardID(data.id);
        if (!(await userCanManageCards(socket, boardId))) {
            throw new Error('Insufficient permissions to update this card');
        }
        await updateCardFromPartial(data.id, data);
        return undefined;
    });

    subscribe(socket, ClientSE.MOVE_CARD, async (data) => {
        const boardId = await getBoardIDFromListID(data.toList);
        if (!(await userCanManageCards(socket, boardId))) {
            throw new Error('Insufficient permissions to move cards on this board');
        }
        await moveCard(data.cardId, data.toList, data.position);
        return undefined;
    });

    subscribe(socket, ClientSE.UPDATE_CARD_ASSIGNEE, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanManageCards(socket, boardId))) {
            throw new Error('Insufficient permissions to update assignees for this card');
        }

        if (data.assigned) {
            await addAssigneeToCard(data.cardId, data.userId);
        } else {
            await removeAssigneeFromCard(data.cardId, data.userId);
        }
        return undefined;
    });
};
