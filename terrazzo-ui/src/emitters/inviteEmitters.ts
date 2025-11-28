import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { InviteId, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getAllInvitesForOrg = async (sockCtx: SocketContextType, orgId: OrganizationId) => {
    const invites = await sockCtx.emit(ClientSE.GET_INVITES_FOR_ORG, orgId);
    return invites;
};

export const deleteInvite = async (sockCtx: SocketContextType, inviteId: InviteId) => {
    await sockCtx.emit(ClientSE.DELETE_INVITE, { inviteId });
};

export const acceptInvite = async (sockCtx: SocketContextType, inviteId: InviteId) => {
    const success = await sockCtx.emit(ClientSE.USE_INVITE, { inviteId });
    return success;
};

export const createInvite = async (sockCtx: SocketContextType, orgId: OrganizationId, maxUses: number | null) => {
    const invite = await sockCtx.emit(ClientSE.CREATE_INVITE, { orgId, maxUses });
    return invite;
};

export const getInvite = async (sockCtx: SocketContextType, inviteId: InviteId) => {
    const invite = await sockCtx.emit(ClientSE.GET_INVITE, inviteId);
    return invite;
};
