import { ClientSE } from '@mosaiq/terrazzo-common';
import { syncRolesForUserInOrg, syncUpdateOrganizationRoles } from '@trz-api/broadcasters';
import { createRole, deleteRole, getRolesForOrg, setRolesForUserInOrg, updateRole } from '@trz-api/controllers/roleController';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { getRoleByIdDb } from '@trz-api/persistence/rolePersistence';
import { userCanAssignRolesInOrganization, userCanEditRolesInOrganization, userCanViewOrganization } from '@trz-api/utils/permissions';
import { getSocketData, subscribe } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerRoleListeners = (socket: Socket, io: Server) => {
    subscribe(socket, ClientSE.GET_ROLES_FOR_ORG, async (data) => {
        if (!(await userCanViewOrganization(socket, data))) {
            throw new Error('User does not have permission to view roles for this organization');
        }
        const roles = await getRolesForOrg(data);
        return roles;
    });

    subscribe(socket, ClientSE.CREATE_ROLE, async (data) => {
        if (!(await userCanEditRolesInOrganization(socket, data.orgId))) {
            throw new Error('User does not have permission to create roles in this organization');
        }
        const newRole = await createRole(data.name, data.color, data.orgId);
        const roles = await getRolesForOrg(data.orgId);
        await syncUpdateOrganizationRoles(io, data.orgId, roles);
        return newRole;
    });

    subscribe(socket, ClientSE.UPDATE_ROLE, async (data) => {
        if (!(await userCanEditRolesInOrganization(socket, data.orgId))) {
            throw new Error('User does not have permission to edit roles in this organization');
        }
        const socketData = getSocketData(socket);
        await updateRole(data, socketData.user.user.id);
        const roles = await getRolesForOrg(data.orgId);
        await syncUpdateOrganizationRoles(io, data.orgId, roles);
        return undefined;
    });

    subscribe(socket, ClientSE.DELETE_ROLE, async (data) => {
        const role = await getRoleByIdDb(data.roleId);
        if (!role) {
            throw new Error(`Role with ID ${data.roleId} not found`);
        }
        if (!(await userCanEditRolesInOrganization(socket, role.orgId))) {
            throw new Error('User does not have permission to delete roles in this organization');
        }
        const socketData = getSocketData(socket);
        await deleteRole(role, socketData.user.user.id);
        const roles = await getRolesForOrg(role.orgId);
        await syncUpdateOrganizationRoles(io, role.orgId, roles);
        return undefined;
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
        await setRolesForUserInOrg(data.userId, data.orgId, data.roleIds, socketData.user.user.id);
        await syncRolesForUserInOrg(io, data.userId, data.orgId);
        return undefined;
    });
};
