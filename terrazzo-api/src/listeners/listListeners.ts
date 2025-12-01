import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { addList, getBoardIDFromListID, getListRes, moveList, updateListFromPartial } from '@trz-api/controllers/listController';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerListListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_LIST, async (data: ClientSEPayload[ClientSE.GET_LIST], reply: ClientSEReply<ClientSE.GET_LIST>) => {
        try {
            if (!data) {
                throw new Error('No list id provided');
            }
            const list = await getListRes(data);
            if (!list) {
                throw new Error('List not found ' + data);
            }
            reply(list);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_LIST, async (data: ClientSEPayload[ClientSE.CREATE_LIST], reply: ClientSEReply<ClientSE.CREATE_LIST>) => {
        try {
            if (!data) {
                throw new Error('No list data provided');
            }
            const list = await addList(data.boardID, data.listName);
            broadcast<ServerSE.ADD_LIST>(socket, ServerSE.ADD_LIST, list, [getRoomCode(RoomType.DATA, data.boardID)]);
            reply(list.id);
        } catch (error: any) {
            console.error('Error creating list', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_LIST_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_LIST_FIELD], reply: ClientSEReply<ClientSE.UPDATE_LIST_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No list data provided');
            }
            await updateListFromPartial(data.id, data);
            const boardId = await getBoardIDFromListID(data.id);
            if (boardId) {
                broadcast<ServerSE.UPDATE_LIST_FIELD>(socket, ServerSE.UPDATE_LIST_FIELD, data, [getRoomCode(RoomType.DATA, boardId)]);
            }
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating list fields', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.MOVE_LIST, async (data: ClientSEPayload[ClientSE.MOVE_LIST], reply: ClientSEReply<ClientSE.MOVE_LIST>) => {
        try {
            await moveList(data.listId, data.position);
            const payload: ServerSEPayload[ServerSE.MOVE_LIST] = { listId: data.listId, position: data.position };
            const boardId = await getBoardIDFromListID(data.listId);
            if (boardId) {
                broadcast<ServerSE.MOVE_LIST>(socket, ServerSE.MOVE_LIST, payload, [getRoomCode(RoomType.DATA, boardId)], false);
            }
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
