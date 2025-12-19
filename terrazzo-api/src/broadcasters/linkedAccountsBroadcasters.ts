import { getRoomCode, RoomType, ServerSE, UserId } from '@mosaiq/terrazzo-common';
import { getLinkedAccountsForUser } from '@trz-api/controllers/linkedAccountController';
import { broadcast } from '@trz-api/utils/socketUtils';
import { Server } from 'socket.io';

/**
 * Syncs the linked accounts for a user by broadcasting the updated list to the user's personal and data rooms.
 */
export const syncUsersLinkedAccounts = async (io: Server, userId: UserId) => {
    try {
        const usersLinkedAccounts = await getLinkedAccountsForUser(userId);
        broadcast({
            io,
            event: ServerSE.UPDATE_USERS_LINKED_ACCOUNTS,
            toRoomIds: [getRoomCode(RoomType.USER, userId), getRoomCode(RoomType.DATA, userId)],
            buildPayload: async (targetUserId) => {
                // No permission check needed as linked accounts are public info
                return { userId: userId, linkedAccounts: usersLinkedAccounts };
            },
        });
    } catch (error: any) {
        console.error('Error syncing users linked accounts', error);
    }
};
