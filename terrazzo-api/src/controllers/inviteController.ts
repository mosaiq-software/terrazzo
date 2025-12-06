import { Invite, InviteId, isInviteExpired, MembershipRecord, OrganizationId, OrgMembershipLevel, UserId } from '@mosaiq/terrazzo-common';
import { createInviteRecord, getAllInviteRecordsForOrganization, getInviteRecordById, updateInviteRecord } from '@trz-api/persistence/invitePersistence';
import { getOrganizationMembershipsForUser } from '@trz-api/persistence/organizationMembershipPersistence';
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

        // check if the user is already a member of the organization, if so, do not add them again but dont fail
        const usersMemberships = await getOrganizationMembershipsForUser(userId);
        if (usersMemberships.find((m) => m.orgId === invite.forOrganizationId)) {
            console.warn('User is already a member of the organization:', userId, invite.forOrganizationId);
            return true;
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
