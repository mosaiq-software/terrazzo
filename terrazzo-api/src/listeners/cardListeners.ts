import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { addAssigneeToCard, removeAssigneeFromCard } from '@trz-api/controllers/cardAssignmentController';
import { addCard, duplicateCard, getBoardIDFromCardID, getSingleFullCard, moveCardToList, updateCardFromPartial } from '@trz-api/controllers/cardController';
import { getBoardIDFromListID } from '@trz-api/controllers/listController';
import { broadcast, getSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerCardListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_CARD, async (data: ClientSEPayload[ClientSE.GET_CARD], reply: ClientSEReply<ClientSE.GET_CARD>) => {
        try {
            if (!data) {
                throw new Error('No card id provided');
            }
            const card = await getSingleFullCard(data);
            if (!card) {
                throw new Error('Card not found ' + data);
            }
            reply(card);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_CARD, async (data: ClientSEPayload[ClientSE.CREATE_CARD], reply: ClientSEReply<ClientSE.CREATE_CARD>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const socketData = getSocketData(socket);
            const card = await addCard(data.listID, data.cardName, undefined, undefined, socketData.user.user.id);
            const boardId = await getBoardIDFromCardID(card.id);
            if (boardId) {
                broadcast<ServerSE.ADD_CARD>(socket, ServerSE.ADD_CARD, card, [getRoomCode(RoomType.DATA, boardId)]);
            }
            reply(card.id);
        } catch (error: any) {
            console.error('Error creating card', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_DUPLICATE_CARD, async (data: ClientSEPayload[ClientSE.CREATE_DUPLICATE_CARD], reply: ClientSEReply<ClientSE.CREATE_DUPLICATE_CARD>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const socketData = getSocketData(socket);
            const card = await duplicateCard(data.cardId, socketData.user.user.id);
            const boardId = await getBoardIDFromCardID(card.id);
            if (boardId) {
                broadcast<ServerSE.ADD_CARD>(socket, ServerSE.ADD_CARD, card, [getRoomCode(RoomType.DATA, boardId)]);
            }
            reply(card.id);
        } catch (error: any) {
            console.error('Error creating card', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_CARD_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_CARD_FIELD], reply: ClientSEReply<ClientSE.UPDATE_CARD_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            await updateCardFromPartial(data.id, data);
            const boardId = await getBoardIDFromCardID(data.id);
            if (boardId) {
                broadcast<ServerSE.UPDATE_CARD_FIELD>(socket, ServerSE.UPDATE_CARD_FIELD, data, [getRoomCode(RoomType.DATA, boardId)]);
            }
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating card fields', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.MOVE_CARD, async (data: ClientSEPayload[ClientSE.MOVE_CARD], reply: ClientSEReply<ClientSE.MOVE_CARD>) => {
        try {
            await moveCardToList(data.cardId, data.toList, data.position);
            const payload: ServerSEPayload[ServerSE.MOVE_CARD] = { ...data };
            const boardId = await getBoardIDFromListID(data.toList);
            if (boardId) {
                broadcast<ServerSE.MOVE_CARD>(socket, ServerSE.MOVE_CARD, payload, [getRoomCode(RoomType.DATA, boardId)], false);
            }
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_CARD_ASSIGNEE, async (data: ClientSEPayload[ClientSE.UPDATE_CARD_ASSIGNEE], reply: ClientSEReply<ClientSE.UPDATE_CARD_ASSIGNEE>) => {
        try {
            if (data.assigned) {
                await addAssigneeToCard(data.cardId, data.userId);
            } else {
                await removeAssigneeFromCard(data.cardId, data.userId);
            }

            const boardId = await getBoardIDFromCardID(data.cardId);

            const payload: ServerSEPayload[ServerSE.UPDATE_CARD_ASSIGNEE] = data;
            broadcast<ServerSE.UPDATE_CARD_ASSIGNEE>(socket, ServerSE.UPDATE_CARD_ASSIGNEE, payload, [getRoomCode(RoomType.DATA, boardId)]);
            broadcast<ServerSE.UPDATE_CARD_ASSIGNEE>(socket, ServerSE.UPDATE_CARD_ASSIGNEE, payload, [getRoomCode(RoomType.USER, data.userId)]);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
