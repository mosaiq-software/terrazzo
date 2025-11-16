import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common/socketTypes';
import { getInvitesForEntity, replyToInvite, sendInvite } from '@trz-api/controllers/inviteController';
import { Server, Socket } from 'socket.io';
import { getSocketData } from './socketUtils';

export const registerCustomSocketEvents = (socket: Socket, io: Server) => {
    socket.on(ClientSE.SEND_INVITE, async (data: ClientSEPayload[ClientSE.SEND_INVITE], reply: ClientSEReply<ClientSE.SEND_INVITE>) => {
        try {
            const socketData = getSocketData(socket);
            const invite = await sendInvite(data.toUsername, socketData.user.user.id, data.entityId, data.role);
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
};
