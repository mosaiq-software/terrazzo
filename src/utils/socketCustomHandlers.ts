import { Server, Socket } from 'socket.io';
import { broadcastToMyRoom, getSocketData, setSocketData, joinRoom, leaveRoom, broadcastToMyselfAndMyRoom, broadcastToUser} from './socketUtils';
import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, ServerSEPayload, RoomType } from '@mosaiq/terrazzo-common/socketTypes';
import {addBoard, getWholeBoard, updateBoardFromPartial} from "@trz-api/controllers/boardController";
import {addList, moveList, updateListFromPartial} from "@trz-api/controllers/listController";
import {addCard, moveCardToList, updateCardFromPartial} from "@trz-api/controllers/cardController";
import { getTextBlockById } from '@trz-api/persistence/textBlockPersistence';
import { isValidTextBlockEvents } from '@mosaiq/terrazzo-common/utils/textUtils';
import { handleTextBlockEvents } from '@trz-api/controllers/textBlockController';
import {checkUsernameTaken, getOrCreateUserByGithubId, setupUser} from "@trz-api/controllers/userController";
import { addOrganization, getFullOrganization, getOrganizationPreview, updateOrganizationFromPartial } from '@trz-api/controllers/organizationController';
import { addProject, getFullProject, getProjectPreview, updateProjectFromPartial } from '@trz-api/controllers/projectController';
import { getUserPreview, getUsersEntities } from '@trz-api/controllers/userController';
import { replyToInvite, sendInvite } from '@trz-api/controllers/inviteController';
import { EntityType } from '@mosaiq/terrazzo-common/constants';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { getProjectById } from '@trz-api/persistence/projectPersistence';
import { deleteMembershipRecord } from '@trz-api/persistence/membershipPersistence';

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

    socket.on(ClientSE.GET_USER_DASH, async (data: ClientSEPayload[ClientSE.GET_USER_DASH], reply: ClientSEReply<ClientSE.GET_USER_DASH>) => {
        try {
            if (!data) {
                throw new Error('No user id provided');
            }
            const entities = await getUsersEntities(data);
            reply(entities);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_ORGANIZATION, async (data: ClientSEPayload[ClientSE.GET_ORGANIZATION], reply: ClientSEReply<ClientSE.GET_ORGANIZATION>) => {
        try {
            if (!data) {
                throw new Error('No org id provided');
            }
            const org = await getFullOrganization(data);
            reply(org);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_PROJECT, async (data: ClientSEPayload[ClientSE.GET_PROJECT], reply: ClientSEReply<ClientSE.GET_PROJECT>) => {
        try {
            if (!data) {
                throw new Error('No project id provided');
            }
            const project = await getFullProject(data);
            reply(project);
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
            reply(board);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.PREVIEW_ORGANIZATION, async (data: ClientSEPayload[ClientSE.PREVIEW_ORGANIZATION], reply: ClientSEReply<ClientSE.PREVIEW_ORGANIZATION>) => {
        try {
            if (!data) {
                throw new Error('No org id provided');
            }
            const orgHeader = await getOrganizationPreview(data);
            reply(orgHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.PREVIEW_PROJECT, async (data: ClientSEPayload[ClientSE.PREVIEW_PROJECT], reply: ClientSEReply<ClientSE.PREVIEW_PROJECT>) => {
        try {
            if (!data) {
                throw new Error('No project id provided');
            }
            const projectHeader = await getProjectPreview(data);
            reply(projectHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.PREVIEW_USER, async (data: ClientSEPayload[ClientSE.PREVIEW_USER], reply: ClientSEReply<ClientSE.PREVIEW_USER>) => {
        try {
            if (!data) {
                throw new Error('No user id provided');
            }
            const userHeader = await getUserPreview(data);
            reply(userHeader);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_ORG, async (data: ClientSEPayload[ClientSE.CREATE_ORG], reply: ClientSEReply<ClientSE.CREATE_ORG>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const orgId = await addOrganization(data.name, data.creator, false);
            reply(orgId);
        } catch (error: any) {
            console.error("Error creating card", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_PROJECT, async (data: ClientSEPayload[ClientSE.CREATE_PROJECT], reply: ClientSEReply<ClientSE.CREATE_PROJECT>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const projectId = await addProject(data.name, data.orgId);
            reply(projectId);
        } catch (error: any) {
            console.error("Error creating card", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_BOARD, async (data: ClientSEPayload[ClientSE.CREATE_BOARD], reply: ClientSEReply<ClientSE.CREATE_BOARD>) => {
        try {
            if (!data) {
                throw new Error('No board data provided');
            }
            const boardID = await addBoard(data.name, data.boardCode, data.projectId);
            reply(boardID);
        } catch (error: any) {
            console.error("Error creating board", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_LIST, async (data: ClientSEPayload[ClientSE.CREATE_LIST], reply: ClientSEReply<ClientSE.CREATE_LIST>) => {
        try {
            if (!data) {
                throw new Error('No list data provided');
            }
            const payload:ServerSEPayload[ServerSE.ADD_LIST] = await addList(data.boardID, data.listName);
            broadcastToMyselfAndMyRoom(socket, ServerSE.ADD_LIST, payload);
            reply(payload.id);
        } catch (error: any) {
            console.error("Error creating list", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_CARD, async (data: ClientSEPayload[ClientSE.CREATE_CARD], reply: ClientSEReply<ClientSE.CREATE_CARD>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            const payload: ServerSEPayload[ServerSE.ADD_CARD] = await addCard(data.listID, data.cardName);
            broadcastToMyselfAndMyRoom(socket, ServerSE.ADD_CARD, payload);
            reply(payload.id);
        } catch (error: any) {
            console.error("Error creating card", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_ORG_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_ORG_FIELD], reply: ClientSEReply<ClientSE.UPDATE_ORG_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No org data provided');
            }
            await updateOrganizationFromPartial(data.id, data);
        } catch (error: any) {
            console.error("Error updating org fields", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_PROJECT_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_PROJECT_FIELD], reply: ClientSEReply<ClientSE.UPDATE_PROJECT_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No project data provided');
            }
            await updateProjectFromPartial(data.id, data);
        } catch (error: any) {
            console.error("Error updating project fields", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_BOARD_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_BOARD_FIELD], reply: ClientSEReply<ClientSE.UPDATE_BOARD_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No board data provided');
            }
            await updateBoardFromPartial(data.id, data);
            const payload:ServerSEPayload[ServerSE.UPDATE_BOARD_FIELD] = data;
            broadcastToMyselfAndMyRoom(socket, ServerSE.UPDATE_BOARD_FIELD, payload);
        } catch (error: any) {
            console.error("Error updating board fields", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_LIST_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_LIST_FIELD], reply: ClientSEReply<ClientSE.UPDATE_LIST_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No list data provided');
            }
            await updateListFromPartial(data.id, data);
            const payload:ServerSEPayload[ServerSE.UPDATE_LIST_FIELD] = data;
            broadcastToMyselfAndMyRoom(socket, ServerSE.UPDATE_LIST_FIELD, payload);
        } catch (error: any) {
            console.error("Error updating list fields", error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_CARD_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_CARD_FIELD], reply: ClientSEReply<ClientSE.UPDATE_CARD_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No card data provided');
            }
            await updateCardFromPartial(data.id, data);
            const payload:ServerSEPayload[ServerSE.UPDATE_CARD_FIELD] = data;
            broadcastToMyselfAndMyRoom(socket, ServerSE.UPDATE_CARD_FIELD, payload);
        } catch (error: any) {
            console.error("Error updating card fields", error);
            reply(undefined, error.message);
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
            const payload:ServerSEPayload[ServerSE.UPDATE_TEXT_BLOCK] = {events: data, updated: text??''};
            broadcastToMyRoom(socket, ServerSE.UPDATE_TEXT_BLOCK, payload);
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

    socket.on(ClientSE.GET_USER, async (data: ClientSEPayload[ClientSE.GET_USER], reply: ClientSEReply<ClientSE.GET_USER>) => {
        try {
            if (!data) {
                throw new Error('No user id provided');
            }
            const user = await getOrCreateUserByGithubId(data);
            reply(user);
        } catch (error: any) {
            reply(undefined , error.message);
        }
    });

    socket.on(ClientSE.SETUP_USER, async (data: ClientSEPayload[ClientSE.SETUP_USER], reply: ClientSEReply<ClientSE.SETUP_USER>) => {
        try {
            if (!data) {
                throw new Error('No user data provided');
            }
            const user = await setupUser(data.id, data.username, data.firstName, data.lastName);
            reply(user);
        } catch (error: any) {
            reply(undefined , error.message);
        }
    });

    socket.on(ClientSE.CHECK_USERNAME_TAKEN, async (data: ClientSEPayload[ClientSE.CHECK_USERNAME_TAKEN], reply: ClientSEReply<ClientSE.CHECK_USERNAME_TAKEN>) => {
        try {
            if (!data) {
                throw new Error('No username provided');
            }
            const taken = await checkUsernameTaken(data);
            reply(taken);
        } catch (error: any) {
            reply(false, error.message);
        }
    });

    socket.on(ClientSE.SEND_INVITE, async (data: ClientSEPayload[ClientSE.SEND_INVITE], reply: ClientSEReply<ClientSE.SEND_INVITE>) => {
        try {
            const socketData = getSocketData(socket);
            let entityName = '';
            if(data.entityType === EntityType.ORG) {
                entityName = (await getOrgById(data.entityId))?.name ?? '';
            } else if(data.entityType === EntityType.PROJECT) {
                entityName = (await getProjectById(data.entityId))?.name ?? '';
            }
            const invite = await sendInvite(data.toUsername, socketData.user.userId, data.entityId, data.entityType, data.role);
            const payload: ServerSEPayload[ServerSE.RECEIVE_INVITE] = invite;
            broadcastToUser(socket, payload.toUser, ServerSE.RECEIVE_INVITE, payload);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.RESPOND_INVITE, async (data: ClientSEPayload[ClientSE.RESPOND_INVITE], reply: ClientSEReply<ClientSE.RESPOND_INVITE>) => {
        try {
            await replyToInvite(data.inviteId, data.response);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.KICK_MEMBER, async (data: ClientSEPayload[ClientSE.KICK_MEMBER], reply: ClientSEReply<ClientSE.KICK_MEMBER>) => {
        try {
            await deleteMembershipRecord(data);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};