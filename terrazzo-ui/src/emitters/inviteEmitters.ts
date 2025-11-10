import { Role } from '@mosaiq/terrazzo-common/constants';
import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { InviteId, MembershipRecord, MembershipRecordId, OrganizationId } from '@mosaiq/terrazzo-common/types';
import { SocketContextType } from '@trz/contexts/socket-context';

export const updateMembershipRecordField = async (sockCtx: SocketContextType, id: MembershipRecordId, partial: Partial<MembershipRecord>) => {
    await sockCtx.emit(ClientSE.UPDATE_MEMBERSHIP_RECORD_FIELD, { ...partial, id });
};

export const sendInvite = async (sockCtx: SocketContextType, toUsername: string, entityId: OrganizationId, role: Role) => {
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

export const revokeMembershipRecord = async (sockCtx: SocketContextType, membershipRecordId: MembershipRecordId) => {
    await sockCtx.emit(ClientSE.KICK_MEMBER, membershipRecordId);
};
