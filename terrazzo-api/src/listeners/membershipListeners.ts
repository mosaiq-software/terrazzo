import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncMembersInOrg, syncUsersOrgs } from '@trz-api/broadcasters';
import { getMembersInOrg, removeMembership } from '@trz-api/controllers/membershipController';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerMembershipListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_ORGANIZATION_MEMBERSHIPS, async (data) => {
        const memberships = await getMembersInOrg(data);
        return memberships;
    });

    subscribe(socket, ClientSE.DELETE_MEMBERSHIP, async (data) => {
        if (!(await userCanAdministerOrganization(socket, data.orgId))) {
            throw new Error(`User does not have permission to delete membership in organization`);
        }
        await removeMembership(data.userId, data.orgId);
        await syncMembersInOrg(io, data.orgId);
        await syncUsersOrgs(io, data.userId);
        return undefined;
    });
};
