import { ClientSE, ClientSEPayload, ClientSEReply } from '@mosaiq/terrazzo-common';
import { createInvite, deleteInvite, getAllInvitesForOrg, useInvite } from '@trz-api/controllers/inviteController';
import { getInviteRecordById } from '@trz-api/persistence/invitePersistence';
import { syncMembersInOrg, syncOrgInvites, syncOrgInvitesFromInviteId } from '@trz-api/utils/broadcasters';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { getSocketData } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerInviteListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_INVITES_FOR_ORG, async (data: ClientSEPayload[ClientSE.GET_INVITES_FOR_ORG], reply: ClientSEReply<ClientSE.GET_INVITES_FOR_ORG>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            if (!(await userCanAdministerOrganization(socket, data))) {
                throw new Error('Insufficient permissions to view invites for this organization');
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
            if (!(await userCanAdministerOrganization(socket, data.orgId))) {
                throw new Error('Insufficient permissions to create invites for this organization');
            }
            const socketData = getSocketData(socket);
            const invite = await createInvite(data.orgId, data.maxUses, socketData.user.user.id);
            await syncOrgInvitesFromInviteId(socket, invite.id);
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
            const invite = await getInviteRecordById(data.inviteId);
            if (!invite) {
                throw new Error('Invite not found');
            }
            if (!(await userCanAdministerOrganization(socket, invite.forOrganizationId))) {
                throw new Error('Insufficient permissions to delete invites for this organization');
            }
            await deleteInvite(data.inviteId);
            await syncOrgInvitesFromInviteId(socket, data.inviteId);
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
                const inviteRecord = await getInviteRecordById(data.inviteId);
                if (!inviteRecord) {
                    throw new Error('Invite not found for syncing org invites');
                }
                await syncOrgInvites(socket, inviteRecord.forOrganizationId);
                await syncMembersInOrg(socket, inviteRecord.forOrganizationId);
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
