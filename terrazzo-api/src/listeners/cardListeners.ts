import { ClientSE } from '@mosaiq/terrazzo-common';
import { addAssigneeToCard, removeAssigneeFromCard } from '@trz-api/controllers/cardAssignmentController';
import { duplicateCard, moveCard } from '@trz-api/controllers/cardController';
import { getBoardIDFromCardID } from '@trz-api/controllers/cardQueries';
import { getBoardIDFromListID } from '@trz-api/controllers/listController';
import { userCanManageCards } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerCardListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.CREATE_DUPLICATE_CARD, async (data) => {
        const boardId = await getBoardIDFromCardID(data.cardId);
        if (!(await userCanManageCards(socket, boardId))) {
            throw new Error('Insufficient permissions to duplicate cards on this board');
        }
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        const newCardId = await duplicateCard(data.cardId, socketData.user.userId);
        return newCardId;
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
