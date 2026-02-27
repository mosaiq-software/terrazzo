import { ClientSE } from '@mosaiq/terrazzo-common';
import { inviteHandler } from '@trz-api/controllers/dataSources/objectHandlers/invite';
import { createInvite, deleteInvite, getAllInvitesForOrg, useInvite } from '@trz-api/controllers/inviteController';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerInviteListeners = (socket: Socket) => {
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
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        const invite = await createInvite(data.orgId, data.maxUses, socketData.user.userId);
        return invite;
    });

    subscribe(socket, ClientSE.DELETE_INVITE, async (data) => {
        const invite = await inviteHandler.read(data.inviteId);
        if (!invite) {
            throw new Error('Invite not found');
        }
        if (!(await userCanAdministerOrganization(socket, invite.forOrganizationId))) {
            throw new Error('Insufficient permissions to delete invites for this organization');
        }
        await deleteInvite(data.inviteId);
        return undefined;
    });

    subscribe(socket, ClientSE.USE_INVITE, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        const success = await useInvite(data.inviteId, socketData.user.userId);
        return success;
    });

    subscribe(socket, ClientSE.GET_INVITE, async (data) => {
        const invite = await inviteHandler.read(data);
        return invite;
    });
};
