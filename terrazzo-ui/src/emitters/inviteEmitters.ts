import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { InviteId, OrganizationId, PermissionLevel } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const sendInvite = async (sockCtx: SocketContextType, toUsername: string, entityId: OrganizationId, role: PermissionLevel) => {
    try {
        const invite = await sockCtx.emit(ClientSE.SEND_INVITE, { toUsername, entityId, role });
        return invite;
    } catch (e) {
        return undefined;
    }
};

export const replyInvite = async (sockCtx: SocketContextType, inviteId: InviteId, accept: boolean) => {
    await sockCtx.emit(ClientSE.RESPOND_INVITE, { inviteId, response: accept });
};
