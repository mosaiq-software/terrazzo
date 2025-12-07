import { ClientSE, getRoomCode, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createRole, deleteRole, getRolesForOrg, updateRole } from '@trz-api/controllers/roleController';
import { getRoleIdsForUserInOrgDb, setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { syncRolesForUserInOrg } from '@trz-api/utils/broadcasters';
import { broadcast, sub } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerRoleListeners = (socket: Socket, io: Server) => {
    sub(socket, ClientSE.GET_ROLES_FOR_ORG, async (data) => {
        const roles = await getRolesForOrg(data);
        return roles;
    });

    sub(socket, ClientSE.CREATE_ROLE, async (data) => {
        const newRole = await createRole(data.name, data.color, data.orgId);
        const roles = await getRolesForOrg(data.orgId);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: data.orgId, roles }, [getRoomCode(RoomType.DATA, data.orgId, RoomSpecifier.ROLES)]);
        return newRole;
    });

    sub(socket, ClientSE.UPDATE_ROLE, async (data) => {
        await updateRole(data);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: data.orgId, roles: await getRolesForOrg(data.orgId) }, [getRoomCode(RoomType.DATA, data.orgId, RoomSpecifier.ROLES)]);
        return undefined;
    });

    sub(socket, ClientSE.DELETE_ROLE, async (data) => {
        const role = await deleteRole(data.roleId);
        const roles = await getRolesForOrg(role.orgId);
        broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: role.orgId, roles }, [getRoomCode(RoomType.DATA, role.orgId, RoomSpecifier.ROLES)]);
        return undefined;
    });

    sub(socket, ClientSE.GET_ROLES_FOR_USER_IN_ORG, async (data) => {
        const roleIds = await getRoleIdsForUserInOrgDb(data.userId, data.orgId);
        return roleIds;
    });

    sub(socket, ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG, async (data) => {
        await setRoleIdsForUserInOrgDb(data.userId, data.orgId, data.roleIds);
        await syncRolesForUserInOrg(socket, data.userId, data.orgId);
        return undefined;
    });
};
