import { ClientSE, OrganizationId, Role, RoleId, UserId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getRolesForOrg = async (sockCtx: SocketContextType, orgId: OrganizationId): Promise<Role[] | undefined> => {
    return await sockCtx.emit(ClientSE.GET_ROLES_FOR_ORG, orgId);
};

export const createRoleOnOrg = async (sockCtx: SocketContextType, name: string, color: string, orgId: OrganizationId) => {
    return await sockCtx.emit(ClientSE.CREATE_ROLE, { name, color, orgId });
};

export const updateRole = async (sockCtx: SocketContextType, role: Role) => {
    await sockCtx.emit(ClientSE.UPDATE_ROLE, role);
};

export const deleteRole = async (sockCtx: SocketContextType, roleId: RoleId) => {
    await sockCtx.emit(ClientSE.DELETE_ROLE, { roleId });
};

export const getRoleIdsForUserInOrg = async (sockCtx: SocketContextType, userId: UserId, orgId: OrganizationId): Promise<RoleId[] | undefined> => {
    return await sockCtx.emit(ClientSE.GET_ROLES_FOR_USER_IN_ORG, { userId, orgId });
};

export const setRoleIdsForUserInOrg = async (sockCtx: SocketContextType, userId: UserId, orgId: OrganizationId, roleIds: RoleId[]) => {
    await sockCtx.emit(ClientSE.UPDATE_ROLES_FOR_USER_IN_ORG, { userId, orgId, roleIds });
};
