import { ClientSE, OrganizationId, OrgMembershipLevel, UserId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getOrganizationMemberships = async (sockCtx: SocketContextType, orgId: OrganizationId) => {
    return await sockCtx.emit(ClientSE.GET_ORGANIZATION_MEMBERSHIPS, orgId);
};

export const updateUsersOrgMembership = async (sockCtx: SocketContextType, userId: UserId, orgId: OrganizationId, newRole: OrgMembershipLevel) => {
    await sockCtx.emit(ClientSE.UPDATE_MEMBERSHIP, { userId, orgId, newPermissionLevel: newRole });
};

export const removeUserFromOrg = async (sockCtx: SocketContextType, userId: UserId, orgId: OrganizationId) => {
    await sockCtx.emit(ClientSE.DELETE_MEMBERSHIP, { userId, orgId });
};
