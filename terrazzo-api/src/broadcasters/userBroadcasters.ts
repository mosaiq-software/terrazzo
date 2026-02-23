import { getRoomCode, RoomType, ServerSE, UserHeader, UserId } from '@mosaiq/terrazzo-common';
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

/**
 * Syncs an updated user field by broadcasting the changes to all sockets in the user's data room.
 */
export const syncUpdateUserField = async (userId: UserId, updates: Partial<UserHeader> & { id: UserId }) => {
    try {
        const usersOrgs = await getOrgsForUser(userId);
        const orgRoomCodes = usersOrgs.map((org) => getRoomCode(RoomType.DATA, org.id));
        broadcast({
            event: ServerSE.UPDATE_USER_FIELD,
            toRoomIds: [getRoomCode(RoomType.DATA, userId), getRoomCode(RoomType.USER, userId), ...orgRoomCodes],
            buildPayload: async (userId) => {
                // A users header is viewable by all users, so no permission check is needed here
                return updates;
            },
        });
    } catch (error: any) {
        console.error('Error syncing update user field', error);
    }
};
