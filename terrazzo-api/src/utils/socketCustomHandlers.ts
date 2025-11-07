import { Server, Socket } from 'socket.io';
import { broadcast, getSocketData, setSocketData, joinRoom, leaveRoom, broadcastToMyRooms } from './socketUtils';
import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, ServerSEPayload, RoomType } from '@mosaiq/terrazzo-common/socketTypes';
import { addBoard, createBoardLabel, getBoardRes, getWholeBoard, removeBoardLabel, updateBoardFromPartial, updateBoardLabels } from '@trz-api/controllers/boardController';
import { addList, getBoardIDFromListID, getListRes, moveList, updateListFromPartial } from '@trz-api/controllers/listController';
import { addCard, duplicateCard, getBoardIDFromCardID, getSingleFullCard, moveCardToList, setCardsLabels, updateCardFromPartial } from '@trz-api/controllers/cardController';
import { getTextBlockById } from '@trz-api/persistence/textBlockPersistence';
import { addOrganization, getFullOrganization, getOrganizationPreview, updateOrganizationFromPartial } from '@trz-api/controllers/organizationController';
import { addProject, getFullProject, getProjectPreview, updateProjectFromPartial } from '@trz-api/controllers/projectController';
import { getUserPreview, getUsersEntities, removeMembership, updateMembershipRecordFromPartial } from '@trz-api/controllers/userController';
import { getInvitesForEntity, replyToInvite, sendInvite } from '@trz-api/controllers/inviteController';
import { addAssigneeToCard, removeAssigneeFromCard } from '@trz-api/controllers/assignmentController';
import { getRoomCode } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { BoardId, CardId } from '@mosaiq/terrazzo-common/types';
import { executeQueryForUser } from '@trz-api/controllers/queryController';
import { createNewDocument, modifyDocument } from '@trz-api/controllers/documentController';
import { getDocumentById } from '@trz-api/persistence/documentPersistence';

export const registerCustomSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ClientSE.JOIN_ROOM, async (room: ClientSEPayload[ClientSE.JOIN_ROOM], reply: ClientSEReply<ClientSE.JOIN_ROOM>) => {
        try {
            const roomUsers = await joinRoom(io, socket, room);
            reply(roomUsers);
        } catch (error: any) {
            reply([], error.message);
        }
    });

    socket.on(ClientSE.LEAVE_ROOM, async (room: ClientSEPayload[ClientSE.LEAVE_ROOM], reply: ClientSEReply<ClientSE.LEAVE_ROOM>) => {
        try {
            leaveRoom(socket, room);
            reply(undefined);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.MOUSE_MOVE, (data: ClientSEPayload[ClientSE.MOUSE_MOVE], reply: ClientSEReply<ClientSE.MOUSE_MOVE>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.mouseRoomData = data;
            setSocketData(socket, socketData);
            broadcastToMyRooms<ServerSE.MOUSE_MOVE>(socket, ServerSE.MOUSE_MOVE, { sid: socket.id, data: data }, [RoomType.MOUSE], false);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.USER_IDLE, (data: ClientSEPayload[ClientSE.USER_IDLE], reply: ClientSEReply<ClientSE.USER_IDLE>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.idle = data;
            setSocketData(socket, socketData);
            broadcastToMyRooms<ServerSE.USER_IDLE>(socket, ServerSE.USER_IDLE, { sid: socket.id, idle: data }, [RoomType.MOUSE, RoomType.TEXT], false);
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
            const board = await getBoardRes(data);
            reply(board);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

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
            console.error('Error creating card', error);
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
            console.error('Error creating card', error);
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
            console.error('Error creating board', error);
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

    socket.on(ClientSE.UPDATE_ORG_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_ORG_FIELD], reply: ClientSEReply<ClientSE.UPDATE_ORG_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No org data provided');
            }
            await updateOrganizationFromPartial(data.id, data);
            broadcast<ServerSE.UPDATE_ORG_FIELD>(socket, ServerSE.UPDATE_ORG_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        } catch (error: any) {
            console.error('Error updating org fields', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_PROJECT_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_PROJECT_FIELD], reply: ClientSEReply<ClientSE.UPDATE_PROJECT_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No project data provided');
            }
            await updateProjectFromPartial(data.id, data);
            broadcast<ServerSE.UPDATE_PROJECT_FIELD>(socket, ServerSE.UPDATE_PROJECT_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        } catch (error: any) {
            console.error('Error updating project fields', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_BOARD_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_BOARD_FIELD], reply: ClientSEReply<ClientSE.UPDATE_BOARD_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No board data provided');
            }
            await updateBoardFromPartial(data.id, data);
            broadcast<ServerSE.UPDATE_BOARD_FIELD>(socket, ServerSE.UPDATE_BOARD_FIELD, data, [getRoomCode(RoomType.DATA, data.id)]);
        } catch (error: any) {
            console.error('Error updating board fields', error);
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
        } catch (error: any) {
            console.error('Error updating list fields', error);
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
        } catch (error: any) {
            console.error('Error updating card fields', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_MEMBERSHIP_RECORD_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_MEMBERSHIP_RECORD_FIELD], reply: ClientSEReply<ClientSE.UPDATE_MEMBERSHIP_RECORD_FIELD>) => {
        try {
            if (!data) {
                throw new Error('No record id provided');
            }
            const record = await updateMembershipRecordFromPartial(data.id, data);
            if (!record) {
                throw new Error('No record found');
            }
            // if(record.entityType === EntityType.ORG){
            //     const org = await getFullOrganization(record.entityId);
            //     broadcast<ServerSE.UPDATE_ORG_FIELD>(socket, ServerSE.UPDATE_ORG_FIELD, {id:record.entityId, members: org.members}, [getRoomCode(RoomType.DATA, record.entityId)]);
            //     for(const prj of org.projects){
            //         broadcast<ServerSE.UPDATE_PROJECT_FIELD>(socket, ServerSE.UPDATE_PROJECT_FIELD, {id:prj.id, orgMembers: org.members}, [getRoomCode(RoomType.DATA, prj.id)]);
            //     }
            // } else if(record.entityType === EntityType.PROJECT) {
            //     const project = await getFullProject(record.entityId);
            //     broadcast<ServerSE.UPDATE_PROJECT_FIELD>(socket, ServerSE.UPDATE_PROJECT_FIELD, {id:record.entityId, externalMembers: project.externalMembers}, [getRoomCode(RoomType.DATA, project.id)]);
            // } else {
            //     throw new Error("Invalid entity type "+record.entityType);
            // }
        } catch (error: any) {
            console.error('Error updating record fields', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_BOARD_LABEL, async (data: ClientSEPayload[ClientSE.CREATE_BOARD_LABEL], reply: ClientSEReply<ClientSE.CREATE_BOARD_LABEL>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const boardId: BoardId = data.boardId;
            const labels = await createBoardLabel(boardId, data.name, data.color);
            broadcast<ServerSE.UPDATE_BOARD_LABELS>(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
        } catch (error: any) {
            console.error('Error creating board label', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_BOARD_LABEL, async (data: ClientSEPayload[ClientSE.UPDATE_BOARD_LABEL], reply: ClientSEReply<ClientSE.UPDATE_BOARD_LABEL>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const boardId: BoardId = data.boardId;
            const labels = await updateBoardLabels(boardId, data.label);
            broadcast<ServerSE.UPDATE_BOARD_LABELS>(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
        } catch (error: any) {
            console.error('Error updating board labels', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.DELETE_BOARD_LABEL, async (data: ClientSEPayload[ClientSE.DELETE_BOARD_LABEL], reply: ClientSEReply<ClientSE.DELETE_BOARD_LABEL>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const boardId: BoardId = data.boardId;
            const labels = await removeBoardLabel(boardId, data.labelId);
            broadcast<ServerSE.UPDATE_BOARD_LABELS>(socket, ServerSE.UPDATE_BOARD_LABELS, { boardId, labels }, [getRoomCode(RoomType.DATA, boardId)]);
        } catch (error: any) {
            console.error('Error deleting board labels', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_CARDS_LABELS, async (data: ClientSEPayload[ClientSE.UPDATE_CARDS_LABELS], reply: ClientSEReply<ClientSE.UPDATE_CARDS_LABELS>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await setCardsLabels(data.cardId, data.labelIds);
            const boardId = await getBoardIDFromCardID(data.cardId);
            if (boardId) {
                broadcast<ServerSE.UPDATE_CARDS_LABELS>(socket, ServerSE.UPDATE_CARDS_LABELS, data, [getRoomCode(RoomType.DATA, boardId)]);
            }
        } catch (error: any) {
            console.error('Error deleting board labels', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_TEXT_BLOCK, async (data: ClientSEPayload[ClientSE.GET_TEXT_BLOCK], reply: ClientSEReply<ClientSE.GET_TEXT_BLOCK>) => {
        try {
            if (!data) {
                throw new Error('No id provided');
            }
            const textBlock = await getTextBlockById(data);
            if (textBlock === null) {
                throw new Error(`Text block ${data} not found`);
            }
            reply(textBlock);
        } catch (error: any) {
            console.error('Error getting text block', data, error);
            reply(undefined, 'Error getting text block');
        }
    });

    socket.on(ClientSE.TEXT_CARET, (data: ClientSEPayload[ClientSE.TEXT_CARET], reply: ClientSEReply<ClientSE.TEXT_CARET>) => {
        try {
            const socketData = getSocketData(socket);
            socketData.user.textRoomData = { caret: data };
            setSocketData(socket, socketData);
            const payload: ServerSEPayload[ServerSE.TEXT_CARET] = { sid: socket.id, caret: data };
            broadcastToMyRooms(socket, ServerSE.TEXT_CARET, payload, [RoomType.TEXT], false);
        } catch (error: any) {
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
        } catch (error: any) {
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
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.SEND_INVITE, async (data: ClientSEPayload[ClientSE.SEND_INVITE], reply: ClientSEReply<ClientSE.SEND_INVITE>) => {
        try {
            const socketData = getSocketData(socket);
            const invite = await sendInvite(data.toUsername, socketData.user.user.id, data.entityId, data.entityType, data.role);
            const payload: ServerSEPayload[ServerSE.RECEIVE_INVITE] = invite;
            // broadcastToUser(socket, payload.toUser.id, ServerSE.RECEIVE_INVITE, payload);
            // const invites = await getInvitesForEntity(data.entityId);
            // if(data.entityType === EntityType.ORG){
            //     const payload:ServerSEPayload[ServerSE.UPDATE_ORG_FIELD] = {id:data.entityId, invites};
            //     broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, data.entityId, ServerSE.UPDATE_ORG_FIELD, payload);
            // } else if(data.entityType === EntityType.PROJECT) {
            //     const payload:ServerSEPayload[ServerSE.UPDATE_PROJECT_FIELD] = {id:data.entityId, invites};
            //     broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, data.entityId, ServerSE.UPDATE_PROJECT_FIELD, payload);
            // } else {
            //     throw new Error("Invalid entity type "+data.entityType);
            // }
            reply(invite);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.RESPOND_INVITE, async (data: ClientSEPayload[ClientSE.RESPOND_INVITE], reply: ClientSEReply<ClientSE.RESPOND_INVITE>) => {
        try {
            const invRec = await replyToInvite(data.inviteId, data.response);
            if (!invRec) {
                throw new Error('No invite record found');
            }
            const invites = await getInvitesForEntity(invRec.entityId);
            // if(invRec.entityType === EntityType.ORG){
            //     const org = await getFullOrganization(invRec.entityId);
            //     const payload:ServerSEPayload[ServerSE.UPDATE_ORG_FIELD] = {id:invRec.entityId, members: org.members};
            //     broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, invRec.entityId, ServerSE.UPDATE_ORG_FIELD, payload);
            //     broadcastToUser(socket, invRec.toUser, ServerSE.UPDATE_ORG_FIELD, payload);
            //     for(const prj of org.projects){
            //         const payload2:ServerSEPayload[ServerSE.UPDATE_PROJECT_FIELD] = {id:prj.id, orgMembers: org.members};
            //         broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, prj.id, ServerSE.UPDATE_PROJECT_FIELD, payload2);
            //     }
            // } else if(invRec.entityType === EntityType.PROJECT) {
            //     const project = await getFullProject(invRec.entityId);
            //     const payload:ServerSEPayload[ServerSE.UPDATE_PROJECT_FIELD] = {id:invRec.entityId, externalMembers: project.externalMembers};
            //     broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, invRec.entityId, ServerSE.UPDATE_PROJECT_FIELD, payload);
            //     broadcastToUser(socket, invRec.toUser, ServerSE.UPDATE_PROJECT_FIELD, payload);
            // } else {
            //     throw new Error("Invalid entity type "+invRec.entityType);
            // }
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.KICK_MEMBER, async (data: ClientSEPayload[ClientSE.KICK_MEMBER], reply: ClientSEReply<ClientSE.KICK_MEMBER>) => {
        try {
            const member = await removeMembership(data);
            if (!member) {
                throw new Error('No member found');
            }
            // if(member.record.entityType === EntityType.ORG){
            //     const org = await getFullOrganization(member.record.entityId);
            //     const payload:ServerSEPayload[ServerSE.UPDATE_ORG_FIELD] = {id:member.record.entityId, members: org.members};
            //     broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, member.record.entityId, ServerSE.UPDATE_ORG_FIELD, payload);
            //     broadcastToUser(socket, member.user.id, ServerSE.UPDATE_ORG_FIELD, payload);
            //     for(const prj of org.projects){
            //         const payload2:ServerSEPayload[ServerSE.UPDATE_PROJECT_FIELD] = {id:prj.id, orgMembers: org.members};
            //         broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, prj.id, ServerSE.UPDATE_PROJECT_FIELD, payload2);
            //     }
            // } else if(member.record.entityType === EntityType.PROJECT) {
            //     const project = await getFullProject(member.record.entityId);
            //     const payload:ServerSEPayload[ServerSE.UPDATE_PROJECT_FIELD] = {id:member.record.entityId, externalMembers: project.externalMembers};
            //     broadcastToMyselfAndAnotherRoom(socket, RoomType.DATA, member.record.entityId, ServerSE.UPDATE_PROJECT_FIELD, payload);
            //     broadcastToUser(socket, member.user.id, ServerSE.UPDATE_PROJECT_FIELD, payload);
            // } else {
            //     throw new Error("Invalid entity type "+member.record.entityType);
            // }
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
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_SEARCH_RESULTS, async (data: ClientSEPayload[ClientSE.GET_SEARCH_RESULTS], reply: ClientSEReply<ClientSE.GET_SEARCH_RESULTS>) => {
        try {
            const socketData = getSocketData(socket);
            const results = await executeQueryForUser(socketData.user.user.id, data.query, data.searchSessionId);
            reply({ results });
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_DOCUMENT, async (data: ClientSEPayload[ClientSE.CREATE_DOCUMENT], reply: ClientSEReply<ClientSE.CREATE_DOCUMENT>) => {
        try {
            const socketData = getSocketData(socket);
            const document = await createNewDocument(data.title, data.parentId, socketData.user.user.id);
            reply(document);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_DOCUMENT, async (data: ClientSEPayload[ClientSE.GET_DOCUMENT], reply: ClientSEReply<ClientSE.GET_DOCUMENT>) => {
        try {
            const document = await getDocumentById(data);
            reply(document);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_DOCUMENT_FIELD, async (data: ClientSEPayload[ClientSE.UPDATE_DOCUMENT_FIELD], reply: ClientSEReply<ClientSE.UPDATE_DOCUMENT_FIELD>) => {
        try {
            const socketData = getSocketData(socket);
            const updatedDocument = await modifyDocument(data.id, data, socketData.user.user.id);
            if (!updatedDocument) {
                throw new Error('No document found');
            }
            broadcast<ServerSE.UPDATE_DOCUMENT_FIELD>(socket, ServerSE.UPDATE_DOCUMENT_FIELD, updatedDocument, [getRoomCode(RoomType.DATA, data.id)]);
        } catch (error: any) {
            reply(undefined, error.message);
        }
    });
};
