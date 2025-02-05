import { Server, Socket } from 'socket.io';
import { broadcastToMyRoom, getSocketData, setSocketData, joinRoom, leaveRoom } from './socketUtils';
import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, ServerSEPayload, UserData } from '@mosaiq/terrazzo-common/socketTypes';
import { getBoardById } from '@trz-api/persistence/boardPersistence';
import {getWholeBoard} from "@trz-api/board/boardCommon";

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
            //TODO: handle error
            //reply({ board: {undefined} }, error.message);
        }
    });
        
};