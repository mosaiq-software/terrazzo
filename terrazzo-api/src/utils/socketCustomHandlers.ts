import { Server, Socket } from 'socket.io';
import { getSocketData } from './socketUtils';
import { ClientSE, ClientSEPayload, ClientSEReply, ServerSE, ServerSEPayload } from '@mosaiq/terrazzo-common/socketTypes';
import { removeMembership, updateMembershipRecordFromPartial } from '@trz-api/controllers/userController';
import { getInvitesForEntity, replyToInvite, sendInvite } from '@trz-api/controllers/inviteController';

export const registerCustomSocketEvents = (socket: Socket, io: Server) => {
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
};
