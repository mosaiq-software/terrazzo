import { Invite } from '../types/inviteTypes';

export const isInviteExpired = (invite: Invite): boolean => {
    if (invite.revokedAt !== null) {
        return true;
    }
    if (invite.maxUses !== null && invite.uses >= invite.maxUses) {
        return true;
    }
    return false;
};
