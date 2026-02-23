import { getRoomCode, OrganizationId, Role, RoomSpecifier, RoomType, ServerSE, UserId } from '@mosaiq/terrazzo-common';
import { getRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { userCanViewOrganization } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketActions';

export const syncRolesForUserInOrg = async (userId: UserId, orgId: OrganizationId) => {
    try {
        const roleIds = await getRoleIdsForUserInOrgDb(userId, orgId);
        const roomKey = `${orgId}_${userId}`;
        broadcast({
            event: ServerSE.UPDATE_ROLES_FOR_USER_IN_ORG,
            toRoomIds: [getRoomCode(RoomType.DATA, roomKey, RoomSpecifier.ROLE_ASSIGNMENTS)],
            buildPayload: async (targetUserId) => {
                if (!(await userCanViewOrganization(targetUserId, orgId))) {
                    throw new Error('Insufficient permissions to view roles for this organization');
                }
                return { userId, orgId, roleIds };
            },
        });
    } catch (error: any) {
        console.error('Error syncing roles for user in organization', error);
    }
};

export const syncUpdateOrganizationRoles = async (orgId: OrganizationId, roles: Role[]) => {
    try {
        broadcast({
            event: ServerSE.UPDATE_ORGANIZATION_ROLES,
            toRoomIds: [getRoomCode(RoomType.DATA, orgId, RoomSpecifier.ROLES)],
            buildPayload: async (userId) => {
                if (!(await userCanViewOrganization(userId, orgId))) {
                    throw new Error('Insufficient permissions to view roles for this organization');
                }
                return { orgId, roles };
            },
        });
    } catch (error: any) {
        console.error('Error syncing update organization roles', error);
    }
};
