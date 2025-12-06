import { ClientSE, ClientSEPayload, ClientSEReply, getRoomCode, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { createRole, deleteRole, getRolesForOrg, updateRole } from '@trz-api/controllers/roleController';
import { getRoleIdsForUserInOrg, setRoleIdsForUserInOrg } from '@trz-api/persistence/roleAssignmentPersistence';
import { syncRolesForUserInOrg } from '@trz-api/utils/broadcasters';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server, Socket } from 'socket.io';

export const registerRoleListeners = (socket: Socket, io: Server) => {
    socket.on(ClientSE.GET_ROLES_FOR_ORG, async (data: ClientSEPayload[ClientSE.GET_ROLES_FOR_ORG], reply: ClientSEReply<ClientSE.GET_ROLES_FOR_ORG>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const roles = await getRolesForOrg(data);
            reply(roles);
        } catch (error: any) {
            console.error('Error getting roles for organization', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.CREATE_ROLE, async (data: ClientSEPayload[ClientSE.CREATE_ROLE], reply: ClientSEReply<ClientSE.CREATE_ROLE>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const newRole = await createRole(data.name, data.color, data.orgId);
            const roles = await getRolesForOrg(data.orgId);
            broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: data.orgId, roles }, [getRoomCode(RoomType.DATA, data.orgId, RoomSpecifier.ROLES)]);
            reply(newRole);
        } catch (error: any) {
            console.error('Error creating role', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_ROLE, async (data: ClientSEPayload[ClientSE.UPDATE_ROLE], reply: ClientSEReply<ClientSE.UPDATE_ROLE>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await updateRole(data);
            broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: data.orgId, roles: await getRolesForOrg(data.orgId) }, [getRoomCode(RoomType.DATA, data.orgId, RoomSpecifier.ROLES)]);
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating role', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.DELETE_ROLE, async (data: ClientSEPayload[ClientSE.DELETE_ROLE], reply: ClientSEReply<ClientSE.DELETE_ROLE>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const role = await deleteRole(data.roleId);
            const roles = await getRolesForOrg(role.orgId);
            broadcast(socket, ServerSE.UPDATE_ORGANIZATION_ROLES, { orgId: role.orgId, roles }, [getRoomCode(RoomType.DATA, role.orgId, RoomSpecifier.ROLES)]);
            reply(undefined);
        } catch (error: any) {
            console.error('Error deleting role', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.GET_ROLES_FOR_USER_IN_ORG, async (data: ClientSEPayload[ClientSE.GET_ROLES_FOR_USER_IN_ORG], reply: ClientSEReply<ClientSE.GET_ROLES_FOR_USER_IN_ORG>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            const roleIds = await getRoleIdsForUserInOrg(data.userId, data.orgId);
            reply(roleIds);
        } catch (error: any) {
            console.error('Error getting roles for user in organization', error);
            reply(undefined, error.message);
        }
    });

    socket.on(ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG, async (data: ClientSEPayload[ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG], reply: ClientSEReply<ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG>) => {
        try {
            if (!data) {
                throw new Error('No data provided');
            }
            await setRoleIdsForUserInOrg(data.userId, data.orgId, data.roleIds);
            await syncRolesForUserInOrg(socket, data.userId, data.orgId);
            reply(undefined);
        } catch (error: any) {
            console.error('Error updating roles for user in organization', error);
            reply(undefined, error.message);
        }
    });
};
