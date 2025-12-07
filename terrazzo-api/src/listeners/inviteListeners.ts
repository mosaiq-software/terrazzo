import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncMembersInOrg, syncOrgInvites, syncOrgInvitesFromInviteId } from '@trz-api/broadcasters';
import { createInvite, deleteInvite, getAllInvitesForOrg, useInvite } from '@trz-api/controllers/inviteController';
import { getInviteRecordByIdDb } from '@trz-api/persistence/invitePersistence';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerInviteListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_INVITES_FOR_ORG, async (data) => {
        if (!(await userCanAdministerOrganization(socket, data))) {
            throw new Error('Insufficient permissions to view invites for this organization');
        }
        const invites = await getAllInvitesForOrg(data);
        return invites;
    });

    subscribe(socket, ClientSE.CREATE_INVITE, async (data) => {
        if (!(await userCanAdministerOrganization(socket, data.orgId))) {
            throw new Error('Insufficient permissions to create invites for this organization');
        }
        const socketData = getSocketData(socket);
        const invite = await createInvite(data.orgId, data.maxUses, socketData.user.user.id);
        await syncOrgInvitesFromInviteId(io, invite.id);
        return invite;
    });

    subscribe(socket, ClientSE.DELETE_INVITE, async (data) => {
        const invite = await getInviteRecordByIdDb(data.inviteId);
        if (!invite) {
            throw new Error('Invite not found');
        }
        if (!(await userCanAdministerOrganization(socket, invite.forOrganizationId))) {
            throw new Error('Insufficient permissions to delete invites for this organization');
        }
        await deleteInvite(data.inviteId);
        await syncOrgInvitesFromInviteId(io, data.inviteId);
        return undefined;
    });

    subscribe(socket, ClientSE.USE_INVITE, async (data) => {
        const socketData = getSocketData(socket);
        const success = await useInvite(data.inviteId, socketData.user.user.id);
        if (success) {
            const inviteRecord = await getInviteRecordByIdDb(data.inviteId);
            if (!inviteRecord) {
                throw new Error('Invite not found for syncing org invites');
            }
            await syncOrgInvites(io, inviteRecord.forOrganizationId);
            await syncMembersInOrg(io, inviteRecord.forOrganizationId);
        }
        return success;
    });

    subscribe(socket, ClientSE.GET_INVITE, async (data) => {
        const invite = await getInviteRecordByIdDb(data);
        return invite;
    });
};
