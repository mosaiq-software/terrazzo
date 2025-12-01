import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { OrganizationHeader, OrganizationId, UserId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getOrganizationData = async (sockCtx: SocketContextType, orgId: OrganizationId): Promise<OrganizationHeader | undefined> => {
    const org = await sockCtx.emit(ClientSE.GET_ORGANIZATION, orgId);
    return org;
};

export const createOrganization = async (sockCtx: SocketContextType, name: string): Promise<OrganizationId | undefined> => {
    return await sockCtx.emit(ClientSE.CREATE_ORG, { name });
};

export const updateOrgField = async (sockCtx: SocketContextType, id: OrganizationId, partial: Partial<OrganizationHeader>) => {
    await sockCtx.emit(ClientSE.UPDATE_ORG_FIELD, { ...partial, id });
};

export const getOrganizationsForUser = async (sockCtx: SocketContextType, userId: UserId) => {
    return await sockCtx.emit(ClientSE.GET_USERS_ORGANIZATIONS, userId);
};
