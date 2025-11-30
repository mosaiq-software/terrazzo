import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { InviteId } from '@mosaiq/terrazzo-common/types';
import { getRoomCode, RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { createInvite, deleteInvite, getAllInvitesForOrg, useInvite } from '@trz-api/controllers/inviteController';
import { getInviteRecordById } from '@trz-api/persistence/invitePersistence';
import { broadcast, getSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerInviteListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_INVITES_FOR_ORG, async (data: ClientSEPayload[ClientSE.GET_INVITES_FOR_ORG], reply: ClientSEReply<ClientSE.GET_INVITES_FOR_ORG>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const invites = await getAllInvitesForOrg(data);
            reply(invites);
        } catch (error: any) {
            console.error('Error getting invites for organization', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_INVITE, async (data: ClientSEPayload[ClientSE.CREATE_INVITE], reply: ClientSEReply<ClientSE.CREATE_INVITE>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const socketData = getSocketData(socket);
            const invite = await createInvite(data.orgId, data.maxUses, socketData.user.user.id);
            await syncOrgInvites(socket, invite.id);
            reply(invite);
        } catch (error: any) {
            console.error('Error creating invite', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.DELETE_INVITE, async (data: ClientSEPayload[ClientSE.DELETE_INVITE], reply: ClientSEReply<ClientSE.DELETE_INVITE>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await deleteInvite(data.inviteId);
            await syncOrgInvites(socket, data.inviteId);
            reply(undefined);
        } catch (error: any) {
            console.error('Error deleting invite', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.USE_INVITE, async (data: ClientSEPayload[ClientSE.USE_INVITE], reply: ClientSEReply<ClientSE.USE_INVITE>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const socketData = getSocketData(socket);
            const success = await useInvite(data.inviteId, socketData.user.user.id);
            if (success) {
                await syncOrgInvites(socket, data.inviteId);
            }
            reply(success);
        } catch (error: any) {
            console.error('Error using invite', error);
            reply(false, error.message);
        }
    });

    socket.on(ClientSE.GET_INVITE, async (data: ClientSEPayload[ClientSE.GET_INVITE], reply: ClientSEReply<ClientSE.GET_INVITE>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const invite = await getInviteRecordById(data);
            reply(invite);
        } catch (error: any) {
            console.error('Error getting invite', error);
            reply(undefined, error.message);
        }
    });
};

const syncOrgInvites = async (socket: Socket, inviteId: InviteId) => {
    try {
        const inviteRecord = await getInviteRecordById(inviteId);
        if (!inviteRecord) {
            throw new Error('Invite not found for syncing org invites');
        }
        const invites = await getAllInvitesForOrg(inviteRecord.forOrganizationId);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_INVITES, { invites: invites, orgId: inviteRecord.forOrganizationId }, [getRoomCode(RoomType.DATA, inviteRecord.forOrganizationId, RoomSpecifier.INVITES)]);
    } catch (error: any) {
        console.error('Error syncing org invites', error);
    }
};
