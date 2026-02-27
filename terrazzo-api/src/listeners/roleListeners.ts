import { ClientSE } from '@mosaiq/terrazzo-common';
import { getRolesForOrg, setRolesForUserInOrg } from '@trz-api/controllers/roleController';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { userCanAssignRolesInOrganization, userCanViewOrganization } from '@trz-api/utils/permissions';
import { subscribe } from '@trz-api/utils/socket/socketActions';
import { getSocketData } from '@trz-api/utils/socket/socketUtils';
import { Socket } from 'socket.io';

export const registerRoleListeners = (socket: Socket) => {
    subscribe(socket, ClientSE.GET_ROLES_FOR_ORG, async (data) => {
        if (!(await userCanViewOrganization(socket, data))) {
            throw new Error('User does not have permission to view roles for this organization');
        }
        const roles = await getRolesForOrg(data);
        return roles;
    });

    subscribe(socket, ClientSE.GET_ROLES_FOR_USER_IN_ORG, async (data) => {
        if (!(await userCanViewOrganization(socket, data.orgId))) {
            throw new Error('User does not have permission to view roles for this organization');
        }
        const roleIds = await getRoleIdsForUserInOrgDb(data.userId, data.orgId);
        return roleIds;
    });

    subscribe(socket, ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG, async (data) => {
        if (!(await userCanAssignRolesInOrganization(socket, data.orgId))) {
            throw new Error('User does not have permission to edit roles in this organization');
        }
        const socketData = getSocketData(socket);
        if (!socketData?.user?.userId) {
            throw new Error('User not authenticated');
        }
        await setRolesForUserInOrg(data.userId, data.orgId, data.roleIds, socketData.user.userId);
        return undefined;
    });
};
