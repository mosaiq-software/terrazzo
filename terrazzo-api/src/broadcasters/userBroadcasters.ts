import { getRoomCode, RoomType, ServerSE, UserId } from '@mosaiq/terrazzo-common';
import { getOrgsForUser } from '@trz-api/controllers/membershipController';
import { userCanGetAndEditPersonalDataForUser } from '@trz-api/utils/permissions';
import { broadcast } from '@trz-api/utils/socket/socketActions';

/**
 * Syncs the organizations for a user by broadcasting the updated list to the user's personal room.
 */
export const syncUsersOrgs = async (userId: UserId) => {
    try {
        const usersOrgs = await getOrgsForUser(userId);
        broadcast({
            event: ServerSE.UPDATE_USERS_ORGANIZATIONS,
            toRoomIds: [getRoomCode(RoomType.USER, userId)],
            buildPayload: async (targetUserId) => {
                if (!(await userCanGetAndEditPersonalDataForUser(targetUserId, userId))) {
                    throw new Error('User does not have permission to get personal data for this user');
                }
                return { userId: userId, organizations: usersOrgs };
            },
        });
    } catch (error: any) {
        console.error('Error syncing users organizations', error);
    }
};
