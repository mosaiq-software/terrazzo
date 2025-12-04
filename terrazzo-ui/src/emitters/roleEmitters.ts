import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { OrganizationId, Role, RoleId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getRolesForOrg = async (sockCtx: SocketContextType, orgId: OrganizationId): Promise<Role[] | undefined> => {
    return await sockCtx.emit(ClientSE.GET_ROLES_FOR_ORG, orgId);
};

export const createRoleOnOrg = async (sockCtx: SocketContextType, name: string, color: string, orgId: OrganizationId) => {
    await sockCtx.emit(ClientSE.CREATE_ROLE, { name, color, orgId });
};

export const updateRole = async (sockCtx: SocketContextType, role: Role) => {
    await sockCtx.emit(ClientSE.UPDATE_ROLE, role);
};

export const deleteRole = async (sockCtx: SocketContextType, roleId: RoleId) => {
    await sockCtx.emit(ClientSE.DELETE_ROLE, { roleId });
};
