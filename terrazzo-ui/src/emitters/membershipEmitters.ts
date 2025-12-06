import { ClientSE, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getOrganizationMemberships = async (sockCtx: SocketContextType, orgId: OrganizationId) => {
    return await sockCtx.emit(ClientSE.GET_ORGANIZATION_MEMBERSHIPS, orgId);
};

export const removeUserFromOrg = async (sockCtx: SocketContextType, userId: UserId, orgId: OrganizationId) => {
    await sockCtx.emit(ClientSE.DELETE_MEMBERSHIP, { userId, orgId });
};
