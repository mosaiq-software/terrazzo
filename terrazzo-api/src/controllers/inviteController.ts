import { Invite, InviteId, isInviteExpired, OrganizationId, UserId } from '@mosaiq/terrazzo-common';
import { getAllInviteRecordsForOrganizationDb } from '@trz-api/persistence/invitePersistence';
import { organizationMembersCollectionHandler } from './dataSources/collectionHandlers/organizationMembers';
import { organizationsCollectionHandler } from './dataSources/collectionHandlers/organizations';
import { inviteHandler } from './dataSources/objectHandlers/invite';

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
        const userOrgs = await organizationsCollectionHandler.read(userId);
        if (userOrgs.includes(invite.forOrganizationId)) {
            console.warn('User is already a member of the organization:', userId, invite.forOrganizationId);
            return true;
        }

        await inviteHandler.update(inviteId, { uses: invite.uses + 1 });
        await organizationMembersCollectionHandler.add(invite.forOrganizationId, [userId]);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};
