import { Invite, InviteId, isInviteExpired, MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { createInviteRecordDb, getAllInviteRecordsForOrganizationDb, getInviteRecordByIdDb, updateInviteRecordDb } from '@trz-api/persistence/invitePersistence';
import { getOrganizationMembershipsForUserDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { createMembershipIfDoesntExist } from './membershipController';

export const getAllInvitesForOrg = async (orgId: OrganizationId): Promise<Invite[]> => {
    return await getAllInviteRecordsForOrganizationDb(orgId);
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
    await createInviteRecordDb(invite);
    return invite;
};

export const deleteInvite = async (inviteId: InviteId): Promise<void> => {
    await updateInviteRecordDb({ id: inviteId, revokedAt: Date.now() });
};

export const useInvite = async (inviteId: InviteId, userId: UserId): Promise<boolean> => {
    try {
        const invite = await getInviteRecordByIdDb(inviteId);
        if (!invite) {
            throw new Error('Invite not found');
        }
        if (isInviteExpired(invite)) {
            console.warn('Attempted to use expired invite:', inviteId);
            return false;
        }

        // check if the user is already a member of the organization, if so, do not add them again but dont fail
        const usersMemberships = await getOrganizationMembershipsForUserDb(userId);
        if (usersMemberships.find((m) => m.orgId === invite.forOrganizationId)) {
            console.warn('User is already a member of the organization:', userId, invite.forOrganizationId);
            return true;
        }

        await updateInviteRecordDb({ id: invite.id, uses: invite.uses + 1 });

        const membershipRecord: MembershipRecord = {
            userId: userId,
            orgId: invite.forOrganizationId,
            joinedAt: Date.now(),
        };
        await createMembershipIfDoesntExist(membershipRecord);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
