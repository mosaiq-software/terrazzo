import { Server, Socket } from 'socket.io';
import {
    broadcastToMyRoom,
    getSocketData,
    setSocketData,
    joinRoom,
    leaveRoom,
    broadcastToMyselfAndMyRoom
} from './socketUtils';
import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common/socketTypes';
import {addBoard, getWholeBoard} from "@trz-api/controllers/boardController";
import {addList, moveList, updateListName} from "@trz-api/controllers/listController";
import {addCard, moveCardToList} from "@trz-api/controllers/cardController";
import { getTextBlockById } from '@trz-api/persistence/textBlockPersistence';
import { isValidTextBlockEvents } from '@mosaiq/terrazzo-common/utils/textUtils';
import { handleTextBlockEvents } from '@trz-api/controllers/textBlockController';

export const registerCustomSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ClientSE.SET_ROOM, async (room: ClientSEPayload[ClientSE.SET_ROOM], reply: ClientSEReply<ClientSE.SET_ROOM>) => {
        try {
            leaveRoom(socket);
            const roomUsers = await joinRoom(io, socket, room);
            reply({ users: roomUsers });
        } catch (error: any) {
            reply({ users: [] }, error.message);
        }
    });

    socket.on(ClientSE.MOUSE_MOVE, (data: ClientSEPayload[ClientSE.MOUSE_MOVE], reply: ClientSEReply<ClientSE.MOUSE_MOVE>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.mouseRoomData = data;
            setSocketData(socket, socketData);
            const payload: ServerSEPayload[ServerSE.MOUSE_MOVE] = { sid: socket.id, data: data };
            broadcastToMyRoom(socket, ServerSE.MOUSE_MOVE, payload);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.USER_IDLE, (data: ClientSEPayload[ClientSE.USER_IDLE], reply: ClientSEReply<ClientSE.USER_IDLE>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.idle = data;
            setSocketData(socket, socketData);
            const payload: ServerSEPayload[ServerSE.USER_IDLE] = { sid: socket.id, idle: data };
            broadcastToMyRoom(socket, ServerSE.USER_IDLE, payload);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_BOARD, async (data: ClientSEPayload[ClientSE.GET_BOARD], reply: ClientSEReply<ClientSE.GET_BOARD>) => {
        try {
            if (!data) {
                throw new Error('No board id provided');
            }
            const board = await getWholeBoard(data);
            reply({ board });
        } catch (error: any) {
            reply({ board: undefined }, error.message);
        }
    });

    socket.on(ClientSE.CREATE_BOARD, async (data: ClientSEPayload[ClientSE.CREATE_BOARD], reply: ClientSEReply<ClientSE.CREATE_BOARD>) => {
        try {
            if (!data) {
                throw new Error('No board data provided');
            }
            const boardID = await addBoard(data.name, data.boardCode);
            reply({ boardID });
        } catch (error: any) {
            console.error("Error creating board", error);
            reply({ boardID: "" }, error.message);
        }
    });

    socket.on(ClientSE.CREATE_LIST, async (data: ClientSEPayload[ClientSE.CREATE_LIST], reply: ClientSEReply<ClientSE.CREATE_LIST>) => {
        try {
            if (!data) {
                throw new Error('No list data provided');
            }
            const payload = await addList(data.boardID, data.listName);
            broadcastToMyselfAndMyRoom(socket, ServerSE.ADD_LIST, payload);
            reply({ success: true });
        } catch (error: any) {
            console.error("Error creating list", error);
            reply({ success: false }, error.message);
        }
    });

    socket.on(ClientSE.CREATE_CARD, async (data: ClientSEPayload[ClientSE.CREATE_CARD], reply: ClientSEReply<ClientSE.CREATE_CARD>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const payload = await addCard(data.listID, data.cardName);
            broadcastToMyselfAndMyRoom(socket, ServerSE.ADD_CARD, payload);
            reply({ success: true });
        } catch (error: any) {
            console.error("Error creating card", error);
            reply({ success: false }, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_LIST_TITLE, async (data: ClientSEPayload[ClientSE.UPDATE_LIST_TITLE], reply: ClientSEReply<ClientSE.UPDATE_LIST_TITLE>) => {
        try {
            if (!data) {
                throw new Error('No list data provided');
            }
            const result = await updateListName(data.listID, data.title);
            const payload = { listID: data.listID, title: data.title };
            if (result){
                broadcastToMyselfAndMyRoom(socket, ServerSE.UPDATE_LIST_TITLE, payload);
            }
            reply({ success: true });
        } catch (error: any) {
            console.error("Error updating list title", error);
            reply({ success: false }, error.message);
        }
    });

    socket.on(ClientSE.GET_TEXT_BLOCK, async (data: ClientSEPayload[ClientSE.GET_TEXT_BLOCK], reply: ClientSEReply<ClientSE.GET_TEXT_BLOCK>) => {
        try {
            if (!data) {
                throw new Error("No id provided");
            }
            const textBlock = await getTextBlockById(data);
            if (textBlock === null) {
                throw new Error(`Text block ${data} not found`);
            }
            reply(textBlock);
        } catch (error: any) {
            console.error("Error getting text block",data,error);
            reply(undefined, "Error getting text block");
        }
    });

    socket.on(ClientSE.UPDATE_TEXT_BLOCK, async (data: ClientSEPayload[ClientSE.UPDATE_TEXT_BLOCK], reply: ClientSEReply<ClientSE.UPDATE_TEXT_BLOCK>) => {
        try {
            if (!isValidTextBlockEvents(data)) {
                throw new Error("Invalid text block event");
            }
            const text = await handleTextBlockEvents(data);
            broadcastToMyRoom(socket, ServerSE.UPDATE_TEXT_BLOCK, {events: data, updated: text??''});
            reply(text);
        } catch (error: any) {
            console.log("Error updating text block",data,error);
            reply(undefined, "Error updating text block");
        }
    });

    socket.on(ClientSE.TEXT_CARET, (data: ClientSEPayload[ClientSE.TEXT_CARET], reply: ClientSEReply<ClientSE.TEXT_CARET>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.textRoomData = {caret: data};
            setSocketData(socket, socketData);
            const payload: ServerSEPayload[ServerSE.TEXT_CARET] = { sid: socket.id, caret: data };
            broadcastToMyRoom(socket, ServerSE.TEXT_CARET, payload);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.MOVE_LIST, async (data: ClientSEPayload[ClientSE.MOVE_LIST], reply: ClientSEReply<ClientSE.MOVE_LIST>) => {
        try {
            await moveList(data.listId, data.position);
            const payload: ServerSEPayload[ServerSE.MOVE_LIST] = {listId: data.listId, position: data.position};
            broadcastToMyRoom(socket, ServerSE.MOVE_LIST, payload);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.MOVE_CARD, async (data: ClientSEPayload[ClientSE.MOVE_CARD], reply: ClientSEReply<ClientSE.MOVE_CARD>) => {
        try {
            await moveCardToList(data.cardId, data.toList, data.position);
            const payload: ServerSEPayload[ServerSE.MOVE_CARD] = {...data};
            broadcastToMyRoom(socket, ServerSE.MOVE_CARD, payload);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};