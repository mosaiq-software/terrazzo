import { getRoomCode, OrganizationId, RoomSpecifier, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { getMembersInOrg } from '@trz-api/controllers/membershipController';
import { userCanViewOrganization } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketActions';

/**
 * Syncs the members in an organization by broadcasting the updated list to all members in the org's membership room.
 */
export const syncMembersInOrg = async (orgId: OrganizationId) => {
    try {
        const allMembers = await getMembersInOrg(orgId);
        broadcast({
            event: ServerSE.UPDATE_ORGANIZATION_MEMBERSHIPS,
            toRoomIds: [getRoomCode(RoomType.DATA, orgId, RoomSpecifier.MEMBERSHIP)],
            buildPayload: async (userId) => {
                if (!(await userCanViewOrganization(userId, orgId))) {
                    throw new Error('Insufficient permissions to view members for this organization');
                }
                return { members: allMembers, orgId: orgId };
            },
        });
    } catch (error: any) {
        console.error('Error syncing organization memberships', error);
    }
};
