import { ClientSE } from '@mosaiq/terrazzo-common';
import { getMembersInOrg, removeMembership } from '@trz-api/controllers/membershipController';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerMembershipListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_ORGANIZATION_MEMBERSHIPS, async (data) => {
        const memberships = await getMembersInOrg(data);
        return memberships;
    });

    subscribe(socket, ClientSE.DELETE_MEMBERSHIP, async (data) => {
        const socketData = getSocketData(socket);
        if (!socketData?.user) {
            throw new Error('User not authenticated');
        }
        const isLeavingSelf = socketData.user.userId === data.userId;
        if (!(await userCanAdministerOrganization(socket, data.orgId)) && !isLeavingSelf) {
            throw new Error(`User does not have permission to delete membership in organization`);
        }
        await removeMembership(data.userId, data.orgId);
        return undefined;
    });
};
