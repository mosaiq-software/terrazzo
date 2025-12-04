import { ClientSE, ClientSEPayload, ClientSEReply, RoomType, ServerSE } from '@mosaiq/terrazzo-common/socketTypes';
import { getRoomCode, RoomSpecifier } from '@mosaiq/terrazzo-common/utils/socketUtils';
import { createRole, deleteRole, getRolesForOrg, updateRole } from '@trz-api/controllers/roleController';
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
};
