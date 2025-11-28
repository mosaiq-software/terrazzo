import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { Organization, OrganizationHeader, OrganizationId, UserId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';
import { NoteType, notify } from '@trz/util/notifications';

export const getOrganizationData = async (sockCtx: SocketContextType, orgId: OrganizationId): Promise<Organization | undefined> => {
    try {
        const org = await sockCtx.emit(ClientSE.GET_ORGANIZATION, orgId);
        return org;
    } catch (e: any) {
        notify(NoteType.ORG_DATA_ERROR, e);
        return undefined;
    }
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

export const getOrganizationPreview = async (sockCtx: SocketContextType, orgId: OrganizationId): Promise<OrganizationHeader | undefined> => {
    const orgHeader = await sockCtx.emit(ClientSE.PREVIEW_ORGANIZATION, orgId);
    return orgHeader;
};
