import { getRoomCode, OrganizationHeader, OrganizationId, RoomType, ServerSE } from '@mosaiq/terrazzo-common';
import { userCanViewOrganization } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketUtils';

export const syncUpdateOrgField = async (
    orgId: OrganizationId,
    updates: Partial<OrganizationHeader> & { id: OrganizationId }
) => {
    try {
        broadcast({
            event: ServerSE.UPDATE_ORG_FIELD,
            toRoomIds: [getRoomCode(RoomType.DATA, orgId)],
            buildPayload: async (userId) => {
                if (!(await userCanViewOrganization(userId, orgId))) {
                    throw new Error('Insufficient permissions to view this organization');
                }
                return updates;
            },
        });
    } catch (error: any) {
        console.error('Error syncing update org field', error);
    }
};
