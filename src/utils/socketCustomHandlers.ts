import { Server, Socket } from 'socket.io';
import {broadcastToMyRoom, getSocketData, setSocketData, joinRoom, leaveRoom, broadcastToAll} from './socketUtils';
import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, ServerSEPayload, UserData } from '@mosaiq/terrazzo-common/socketTypes';
import {addBoard, getWholeBoard} from "@trz-api/board/boardCommon";
import {addList} from "@trz-api/board/listCommon";

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
            console.log("Creating board with data", data);
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
            console.log("Creating list with data", data);
            const payload = await addList(data.boardID, data.listName);
            broadcastToAll(io, ServerSE.ADD_LIST, payload);
            reply({ success: true });
        } catch (error: any) {
            console.error("Error creating list", error);
            reply({ success: false }, error.message);
        }
    });
};