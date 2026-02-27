import { ClientSE } from '@mosaiq/terrazzo-common';
import { getAllInvitesForOrg, useInvite } from '@trz-api/controllers/inviteController';
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

    subscribe(socket, ClientSE.USE_INVITE, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        const success = await useInvite(data.inviteId, socketData.user.userId);
        return success;
    });
};
