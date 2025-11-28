import { Invite, InviteId, MembershipRecord, OrganizationId, OrgMembershipLevel, UserId } from '@mosaiq/terrazzo-common/types';
import { isInviteExpired } from '@mosaiq/terrazzo-common/utils/inviteUtils';
import { createInviteRecord, getAllInviteRecordsForOrganization, getInviteRecordById, updateInviteRecord } from '@trz-api/persistence/invitePersistence';
import { upsertMembership } from './membershipController';

export const getAllInvitesForOrg = async (orgId: OrganizationId): Promise<Invite[]> => {
    return await getAllInviteRecordsForOrganization(orgId);
};

export const createInvite = async (orgId: OrganizationId, maxUses: number | null, createdById: UserId) => {
    const invite: Invite = {
        id: crypto.randomUUID(),
        forOrganizationId: orgId,
        maxUses: maxUses,
        uses: 0,
        createdById: createdById,
        createdAt: Date.now(),
        revokedAt: null,
    };
    await createInviteRecord(invite);
    return invite;
};

export const deleteInvite = async (inviteId: InviteId): Promise<void> => {
    await updateInviteRecord({ id: inviteId, revokedAt: Date.now() });
};

export const useInvite = async (inviteId: InviteId, userId: UserId): Promise<boolean> => {
    try {
        const invite = await getInviteRecordById(inviteId);
        if (!invite) {
            throw new Error('Invite not found');
        }
        if (isInviteExpired(invite)) {
            console.warn('Attempted to use expired invite:', inviteId);
            return false;
        }

        await updateInviteRecord({ id: invite.id, uses: invite.uses + 1 });

        const membershipRecord: MembershipRecord = {
            userId: userId,
            orgId: invite.forOrganizationId,
            permissionLevel: OrgMembershipLevel.MEMBER,
        };
        await upsertMembership(membershipRecord);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
