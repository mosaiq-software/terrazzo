import { getRoomCode, InviteId, OrganizationId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getAllInvitesForOrg } from '@trz-api/controllers/inviteController';
import { getInviteRecordByIdDb } from '@trz-api/persistence/invitePersistence';
import { userCanAdministerOrganization } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncOrgInvitesFromInviteId = async (inviteId: InviteId) => {
    try {
        const inviteRecord = await getInviteRecordByIdDb(inviteId);
        if (!inviteRecord) {
            throw new Error('Invite not found for syncing org invites');
        }
        await syncOrgInvites(inviteRecord.forOrganizationId);
    } catch (error: any) {
        console.error('Error syncing org invites from invite id', error);
    }
};

/**
 * Syncs the invites for an organization by broadcasting the updated list to all members in the org's invite room.
 */
export const syncOrgInvites = async (orgId: OrganizationId) => {
    try {
        const invites = await getAllInvitesForOrg(orgId);
        broadcast({
            event: ServerSE.UPDATE_ORGANIZATION_INVITES,
            toRoomIds: [getRoomCode(RoomType.DATA, orgId, RoomSpecifier.INVITES)],
            buildPayload: async (userId) => {
                if (!(await userCanAdministerOrganization(userId, orgId))) {
                    throw new Error('Insufficient permissions to view invites for this organization');
                }
                return { invites: invites, orgId: orgId };
            },
        });
    } catch (error: any) {
        console.error('Error syncing org invites', error);
    }
};
