import { Invite, InviteId, isInviteExpired, MembershipRecord, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { syncMembersInOrg, syncOrgInvites } from '@trz-api/broadcasters';
import { getAllInviteRecordsForOrganizationDb } from '@trz-api/persistence/invitePersistence';
import { getOrganizationMembershipsForUserDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { inviteHandler } from './dataSources/objectHandlers/invite';
import { createMembershipIfDoesntExist } from './membershipController';

export const getAllInvitesForOrg = async (orgId: OrganizationId): Promise<Invite[]> => {
    return await getAllInviteRecordsForOrganizationDb(orgId);
};

export const useInvite = async (inviteId: InviteId, userId: UserId): Promise<boolean> => {
    try {
        const invite = await inviteHandler.read(inviteId);
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

        await inviteHandler.update(inviteId, { uses: invite.uses + 1 }, { preventSync: true });

        const membershipRecord: MembershipRecord = {
            userId: userId,
            orgId: invite.forOrganizationId,
            joinedAt: Date.now(),
        };
        await createMembershipIfDoesntExist(membershipRecord);

        // Sync updates
        await syncOrgInvites(invite.forOrganizationId);
        await syncMembersInOrg(invite.forOrganizationId);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
