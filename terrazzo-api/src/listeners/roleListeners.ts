import { ClientSE, getRoomCode, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createRole, deleteRole, getRolesForOrg, updateRole } from '@trz-api/controllers/roleController';
import { getRoleIdsForUserInOrgDb, setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { getRoleByIdDb } from '@trz-api/persistence/rolePersistence';
import { syncRolesForUserInOrg } from '@trz-api/utils/broadcasters';
import { userCanAssignRolesInOrganization, userCanEditRolesInOrganization, userCanViewOrganization } from '@trz-api/utils/permissions';
import { broadcast, subscribe } from '@trz-api/utils/socketUtils';
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
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: data.orgId, roles }, [getRoomCode(RoomType.DATA, data.orgId, RoomSpecifier.ROLES)]);
        return newRole;
    });

    subscribe(socket, ClientSE.UPDATE_ROLE, async (data) => {
        if (!(await userCanEditRolesInOrganization(socket, data.orgId))) {
            throw new Error('User does not have permission to edit roles in this organization');
        }
        await updateRole(data);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: data.orgId, roles: await getRolesForOrg(data.orgId) }, [getRoomCode(RoomType.DATA, data.orgId, RoomSpecifier.ROLES)]);
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
        await deleteRole(data.roleId);
        const roles = await getRolesForOrg(role.orgId);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: role.orgId, roles }, [getRoomCode(RoomType.DATA, role.orgId, RoomSpecifier.ROLES)]);
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
        await setRoleIdsForUserInOrgDb(data.userId, data.orgId, data.roleIds);
        await syncRolesForUserInOrg(socket, data.userId, data.orgId);
        return undefined;
    });
};
