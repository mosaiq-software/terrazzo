import { ClientSE } from '@mosaiq/terrazzo-common';
import { getMembersInOrg, removeMembership } from '@trz-api/controllers/membershipController';
import { syncMembersInOrg, syncUsersOrgs } from '@trz-api/utils/broadcasters';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerMembershipListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_ORGANIZATION_MEMBERSHIPS, async (data) => {
        const memberships = await getMembersInOrg(data);
        return memberships;
    });

    sub(socket, ClientSE.DELETE_MEMBERSHIP, async (data) => {
        if (!(await userCanAdministerOrganization(socket, data.orgId))) {
            throw new Error(`User does not have permission to delete membership in organization`);
        }
        await removeMembership(data.userId, data.orgId);
        await syncMembersInOrg(socket, data.orgId);
        await syncUsersOrgs(socket, data.userId);
        return undefined;
    });
};
